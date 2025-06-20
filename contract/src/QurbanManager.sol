// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "./QurbanAnimalNFT.sol";
import "./QurbanToken.sol";

/**
 * @title QurbanManager - ERC1155 untuk Manajemen Qurban
 * @dev Contract utama yang mengelola seluruh sistem qurban
 */
contract QurbanManager is ERC1155, AccessControl, ReentrancyGuard, Pausable, IERC721Receiver {
    bytes32 public constant RT_ROLE = keccak256("RT_ROLE");
    
    QurbanToken public qurbanToken;
    QurbanAnimalNFT public qurbanAnimalNFT;
    
    // Token IDs untuk ERC1155
    uint256 public constant SAPI_TOKEN = 1;
    uint256 public constant KAMBING_TOKEN = 2;
    
    // Harga dan kuota
    uint256 public constant PRICE_PER_SHARE = 1000 * 10**18; // 1000 QBC
    uint256 public constant SAPI_SHARES = 1;   // 7 orang urunan //TEST
    uint256 public constant KAMBING_SHARES = 1; // 1 orang urunan
    uint256 public constant SAPI_COUPONS = 14;  // 7 × 2 kupon
    uint256 public constant KAMBING_COUPONS = 2; // 1 × 2 kupon
    
    struct QurbanCampaign {
        uint256 tokenId;        // 1 untuk sapi, 2 untuk kambing
        uint256 targetAmount;   // Target QBC yang harus terkumpul
        uint256 collectedAmount; // QBC yang sudah terkumpul
        uint256 participants;   // Jumlah peserta
        uint256 maxParticipants; // Maksimal peserta
        uint256 deadline;       // Deadline urunan
        uint256 claimDeadline;  // Deadline claim kupon
        bool isCompleted;       // Apakah sudah mencapai target
        bool isCancelled;       // Apakah dibatalkan
        bool couponsGenerated;  // Apakah kupon sudah di-generate
        bool couponAssigned;
        mapping(address => uint256) contributions; // Kontribusi per address
        address[] contributors; // Daftar kontributor
    }

    struct TokenInfo {
        uint256 campaignId;    // ID campaign
        uint256 animalTokenId; // ID NFT hewan yang dipotong
        string animalType;     // "sapi" atau "kambing"
        bool isClaimed;        // Status sudah di-claim
        uint256 claimDeadline; // Deadline claim
    }

    uint256[] public allCampaignIds;
    
    mapping(uint256 => QurbanCampaign) public campaigns;
    // mapping(address => uint256) public userParticipations;
    mapping(uint256 => TokenInfo) public tokenInfo;
    mapping(uint256 => uint256[]) public animalToCoupons; // animalTokenId -> couponTokenIds[]
    mapping(uint256 => uint256[]) public campaignToCoupons; // campaignId -> couponTokenIds[]
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => uint256) public couponOwner;
    
    uint256 private _nextCouponId = 1;
    uint256 private _nextCampaignId = 1;

    uint256 public constant COUPON_BASE = 2000;
    
    event CouponMinted(uint256 indexed tokenId, uint256 indexed campaignId, uint256 indexed animalTokenId, address recipient);
    event CouponClaimed(uint256 indexed tokenId, address indexed claimer);
    event CouponAssigned(uint256 indexed tokenId, address indexed newOwner);
    event CampaignCreated(uint256 indexed campaignId, uint256 indexed tokenId, uint256 deadline);
    event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event CampaignCompleted(uint256 indexed campaignId);
    event AnimalPurchased(uint256 indexed campaignId, uint256 indexed animalTokenId, string animalType, uint256 weight);
    event CampaignCancelled(uint256 indexed campaignId);
    event CouponsGenerated(uint256 indexed campaignId, uint256 indexed animalTokenId, uint256[] couponTokenIds);
    event RefundIssued(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    
    constructor(
        address qurbanTokenAddress,
        address qurbanAnimalNFTAddress
    ) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RT_ROLE, msg.sender);
        
        qurbanToken = QurbanToken(qurbanTokenAddress);
        qurbanAnimalNFT = QurbanAnimalNFT(qurbanAnimalNFTAddress);
    }
    
    function createCampaign(
        uint256 tokenId, // 1 untuk sapi, 2 untuk kambing
        uint256 durationInDays // 10 hari untuk produksi, bisa diubah untuk demo
    ) public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        require(tokenId == SAPI_TOKEN || tokenId == KAMBING_TOKEN, "Invalid token ID");
        
        uint256 campaignId = _nextCampaignId++;
        QurbanCampaign storage campaign = campaigns[campaignId];
        
        campaign.tokenId = tokenId;
        campaign.deadline = block.timestamp + (durationInDays * 1 days);
        campaign.claimDeadline = campaign.deadline + (12 days); // H+12 setelah urunan selesai
        
        if (tokenId == SAPI_TOKEN) {
            campaign.targetAmount = SAPI_SHARES * PRICE_PER_SHARE;
            campaign.maxParticipants = SAPI_SHARES;
        } else {
            campaign.targetAmount = KAMBING_SHARES * PRICE_PER_SHARE;
            campaign.maxParticipants = KAMBING_SHARES;
        }

        allCampaignIds.push(campaignId);
        
        emit CampaignCreated(campaignId, tokenId, campaign.deadline);
        return campaignId;
    }

    function getAllCampaignIds() public view returns (uint256[] memory) {
        return allCampaignIds;
    }
    
    function contribute(uint256 campaignId) public nonReentrant whenNotPaused {
        QurbanCampaign storage campaign = campaigns[campaignId];
        
        require(!campaign.isCompleted && !campaign.isCancelled, "Campaign not active");
        require(block.timestamp <= campaign.deadline, "Campaign ended");
        require(campaign.participants < campaign.maxParticipants, "Campaign full");
        require(campaign.contributions[msg.sender] == 0, "Already contributed");
        
        // Transfer QBC dari user ke contract
        require(
            qurbanToken.transferFrom(msg.sender, address(this), PRICE_PER_SHARE),
            "Transfer failed"
        );
        
        campaign.contributions[msg.sender] = PRICE_PER_SHARE;
        campaign.contributors.push(msg.sender);
        campaign.collectedAmount += PRICE_PER_SHARE;
        campaign.participants++;
        
        // userParticipations[msg.sender] = campaignId;
        
        // Mint ERC1155 token untuk tracking
        _mint(msg.sender, campaignId, 1, "");
        
        emit ContributionMade(campaignId, msg.sender, PRICE_PER_SHARE);
        
        // Auto complete dan mint animal NFT jika target tercapai
        if (campaign.collectedAmount >= campaign.targetAmount) {
            campaign.isCompleted = true;
            
            // Auto mint animal NFT saat campaign completed
            string memory animalType = campaign.tokenId == SAPI_TOKEN ? "sapi" : "kambing";
            uint256 weight = campaign.tokenId == SAPI_TOKEN ? 400 : 25; // Default weight
            
            uint256 animalTokenId = qurbanAnimalNFT.mintAnimal(
                campaignId,
                animalType,
                weight,
                "Lokal", // Default breed
                "halal-cert-hash", // Placeholder certificate hash
                address(this) // Contract sebagai owner sementara
            );
            
            emit CampaignCompleted(campaignId);
            emit AnimalPurchased(campaignId, animalTokenId, animalType, weight);
        }
    }
    
    function generateCouponsFromAnimal(uint256 campaignId) public onlyRole(RT_ROLE) {
        QurbanCampaign storage campaign = campaigns[campaignId];
        
        require(campaign.isCompleted, "Campaign not completed");
        require(!campaign.couponsGenerated, "Coupons already generated");
        // require(block.timestamp > campaign.deadline, "Campaign still active");
        
        campaign.couponsGenerated = true;
        
        // Get animal NFT yang sudah di-mint
        uint256 animalTokenId = qurbanAnimalNFT.getAnimalByCampaign(campaignId);
        require(animalTokenId > 0, "Animal not found");
        
        string memory animalType = campaign.tokenId == SAPI_TOKEN ? "sapi" : "kambing";
        string memory newUri = campaign.tokenId == SAPI_TOKEN ? "ipfs://QmToLhDUTFCfTeosjyBXbAHUxE8sbhgmqueUmpGV7kSMo8" : "ipfs://QmYjc8jTa15So3HzcqdtMovYwHCZzTcKJFcvNHH1ATonQk";
        uint256 couponsPerParticipant = 2;
        uint256 totalCoupons = campaign.participants * couponsPerParticipant;
        
        // Generate weight distribution (simulasi pembagian daging)

        uint256[] memory newCouponIds = new uint256[](totalCoupons);
        uint256[] memory newCouponValues = new uint256[](totalCoupons); // Akan diisi dengan 1 untuk setiap kupon unik
        
        for (uint256 i = 0; i < totalCoupons; i++) {
            uint256 tokenId = COUPON_BASE + _nextCouponId++; // ID unik untuk setiap kupon
            newCouponIds[i] = tokenId;
            newCouponValues[i] = 1; // Setiap kupon unik memiliki supply 1
            
            tokenInfo[tokenId] = TokenInfo({
                campaignId: campaignId,
                animalTokenId: animalTokenId,
                animalType: animalType,
                isClaimed: false,
                claimDeadline: campaign.claimDeadline
            });
            
            animalToCoupons[animalTokenId].push(tokenId);
            campaignToCoupons[campaignId].push(tokenId);
            setTokenURI(tokenId, newUri);
            
            emit CouponMinted(tokenId, campaignId, animalTokenId, address(this)); // Event per kupon
        }

        _mintBatch(address(this), newCouponIds, newCouponValues, "");
        
        // Mark animal as slaughtered
        qurbanAnimalNFT.markAsSlaughtered(animalTokenId);
        
        emit CouponsGenerated(campaignId, animalTokenId, newCouponIds);
    }
    
    function assignCouponsToWarga(
        uint256 campaignId,
        address[] memory wargaAddresses
    ) public onlyRole(RT_ROLE) {
        QurbanCampaign storage campaign = campaigns[campaignId];
        require(campaign.couponsGenerated, "Coupons not generated yet");
        
        uint256[] memory couponIds = campaignToCoupons[campaignId];
        require(couponIds.length == wargaAddresses.length, "Mismatch coupon and address count");
        
        for (uint i = 0; i < couponIds.length; i++) {
            uint256 currentCouponId = couponIds[i];
            address targetWarga = wargaAddresses[i];
            uint256[] memory idsToTransfer = new uint256[](1);
            idsToTransfer[0] = currentCouponId;
            uint256[] memory valuesToTransfer = new uint256[](1);
            valuesToTransfer[0] = 1;
            couponOwner[targetWarga] = currentCouponId;
            _safeTransferFrom(address(this), targetWarga, currentCouponId, 1, "");
            emit CouponAssigned(currentCouponId, targetWarga);
        }

        campaign.couponAssigned = true;
    }

    function claimCoupon(uint256 tokenId) public nonReentrant whenNotPaused {
        // Pastikan token ID adalah kupon
        require(tokenId >= COUPON_BASE, "Invalid token ID for coupon claim");
        
        // Pastikan msg.sender adalah pemilik kupon
        require(balanceOf(msg.sender, tokenId) > 0, "Not the owner of this coupon");
        
        TokenInfo storage coupon = tokenInfo[tokenId];
        require(!coupon.isClaimed, "Coupon already claimed");
        require(block.timestamp <= coupon.claimDeadline, "Claim deadline passed");
        
        coupon.isClaimed = true; // Tandai kupon sebagai sudah diklaim

        // burn

        couponOwner[msg.sender] = 0;
        _burn(msg.sender, tokenId, 1);
        // ---------------------------------------------
        
        emit CouponClaimed(tokenId, msg.sender);
    }
    
    function cancelCampaign(uint256 campaignId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        QurbanCampaign storage campaign = campaigns[campaignId];
        
        require(!campaign.isCompleted, "Campaign already completed");
        require(!campaign.isCancelled, "Campaign already cancelled");
        
        campaign.isCancelled = true;
        
        // Refund semua kontributor
        for (uint256 i = 0; i < campaign.contributors.length; i++) {
            address contributor = campaign.contributors[i];
            uint256 contribution = campaign.contributions[contributor];
            
            if (contribution > 0) {
                campaign.contributions[contributor] = 0;
                qurbanToken.transfer(contributor, contribution);
                
                // Burn ERC1155 token
                _burn(contributor, campaign.tokenId, 1);
                
                emit RefundIssued(campaignId, contributor, contribution);
            }
        }
        
        emit CampaignCancelled(campaignId);
    }
    
    function autoRefundExpiredCampaigns(uint256[] memory campaignIds) public {
        for (uint256 i = 0; i < campaignIds.length; i++) {
            uint256 campaignId = campaignIds[i];
            QurbanCampaign storage campaign = campaigns[campaignId];
            
            if (!campaign.isCompleted && 
                !campaign.isCancelled && 
                block.timestamp > campaign.deadline) {
                
                this.cancelCampaign(campaignId);
            }
        }
    }
    
    function getUserContribution(uint256 campaignId) public view returns (address[] memory) {
        return campaigns[campaignId].contributors;
    }
    
    // function getUserParticipations(address user) public view returns (uint256[] memory) {
    //     return userParticipations[user];
    // }

    function getMyCoupon() public view returns (uint256) {
        return couponOwner[msg.sender];
    }

    function getCouponByCampaign(uint campaignId) public view returns (uint256[] memory) {
        return campaignToCoupons[campaignId];
    }
    
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Set metadata URI untuk token
     */
    function setTokenURI(uint256 tokenId, string memory newuri) public {
        // TODO: Store custom URI per token
        // Check if URI is empty or not a URI string
        
        require(bytes(newuri).length > 0, "Invalid custom metadata uri");
        _tokenURIs[tokenId] = newuri;   
    }

    function uri(uint256 _tokenId) public view override returns (string memory) {
        return _tokenURIs[_tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        require(operator == address(this), "QurbanManager: Not operator of this transfer"); // QurbanManager adalah operator
        return this.onERC721Received.selector;
    }

    /**
    * @dev Lihat {IERC1155Receiver-onERC1155Received}.
    * Fungsinya dipanggil ketika ERC1155 token ditransfer ke kontrak ini.
    * Harus mengembalikan `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
    * jika kontrak ingin menerima token tersebut.
    */
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    /**
    * @dev Lihat {IERC1155Receiver-onERC1155BatchReceived}.
    * Fungsinya dipanggil ketika beberapa ERC1155 token ditransfer ke kontrak ini dalam satu batch.
    * Harus mengembalikan `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
    * jika kontrak ingin menerima token-token tersebut.
    */
    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external returns (bytes4) {
        // Sama seperti onERC1155Received, Anda bisa menambahkan logika di sini.
        return this.onERC1155BatchReceived.selector;
    }
}