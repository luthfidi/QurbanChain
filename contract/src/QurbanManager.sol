// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "lib/openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";
import "lib/openzeppelin-contracts/contracts/access/AccessControl.sol";
import "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "lib/openzeppelin-contracts/contracts/utils/Pausable.sol";
import "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";

import "./QurbanCouponNFT.sol";
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
    QurbanCouponNFT public qurbanCouponNFT;
    
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
        mapping(address => uint256) contributions; // Kontribusi per address
        address[] contributors; // Daftar kontributor
    }
    
    mapping(uint256 => QurbanCampaign) public campaigns;
    mapping(address => uint256[]) public userParticipations;
    
    uint256 private _nextCampaignId = 1;
    
    event CampaignCreated(uint256 indexed campaignId, uint256 indexed tokenId, uint256 deadline);
    event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event CampaignCompleted(uint256 indexed campaignId);
    event AnimalPurchased(uint256 indexed campaignId, uint256 indexed animalTokenId, string animalType, uint256 weight);
    event CampaignCancelled(uint256 indexed campaignId);
    event CouponsGenerated(uint256 indexed campaignId, uint256 indexed animalTokenId, uint256[] couponTokenIds);
    event RefundIssued(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    
    constructor(
        address qurbanTokenAddress,
        address qurbanAnimalNFTAddress,
        address qurbanCouponNFTAddress
    ) ERC1155("https://api.qurbanchain.com/metadata/{id}.json") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RT_ROLE, msg.sender);
        
        qurbanToken = QurbanToken(qurbanTokenAddress);
        qurbanAnimalNFT = QurbanAnimalNFT(qurbanAnimalNFTAddress);
        qurbanCouponNFT = QurbanCouponNFT(qurbanCouponNFTAddress);
        
        // Grant roles to this contract
        // qurbanToken.grantRole(qurbanToken.BURNER_ROLE(), address(this));
        // qurbanAnimalNFT.grantRole(qurbanAnimalNFT.MINTER_ROLE(), address(this));
        // qurbanCouponNFT.grantRole(qurbanCouponNFT.MINTER_ROLE(), address(this));
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
        
        emit CampaignCreated(campaignId, tokenId, campaign.deadline);
        return campaignId;
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
        
        userParticipations[msg.sender].push(campaignId);
        
        // Mint ERC1155 token untuk tracking
        _mint(msg.sender, campaign.tokenId, 1, "");
        
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
        uint256 couponsPerParticipant = 2;
        uint256 totalCoupons = campaign.participants * couponsPerParticipant;
        
        // Generate weight distribution (simulasi pembagian daging)
        uint256[] memory portionWeights = _generatePortionWeights(campaign.tokenId, totalCoupons);
        
        // Mint coupons dari animal NFT
        uint256[] memory couponTokenIds = qurbanCouponNFT.mintCouponsFromAnimal(
            campaignId,
            animalTokenId,
            animalType,
            totalCoupons,
            portionWeights,
            address(this), // Mint to contract first
            campaign.claimDeadline
        );
        
        // Mark animal as slaughtered
        qurbanAnimalNFT.markAsSlaughtered(animalTokenId);
        
        emit CouponsGenerated(campaignId, animalTokenId, couponTokenIds);
    }
    
    function _generatePortionWeights(uint256 tokenId, uint256 totalCoupons) private pure returns (uint256[] memory) {
        uint256[] memory weights = new uint256[](totalCoupons);
        uint256 baseWeight = tokenId == SAPI_TOKEN ? 2500 : 1200; // Base weight in grams
        
        for (uint256 i = 0; i < totalCoupons; i++) {
            // Add some variation to make it realistic
            uint256 variation = (i % 3) * 200; // 0, 200, 400 gram variation
            weights[i] = baseWeight + variation;
        }
        
        return weights;
    }
    
    function assignCouponsToWarga(
        uint256 campaignId,
        address[] memory wargaAddresses
    ) public onlyRole(RT_ROLE) {
        QurbanCampaign storage campaign = campaigns[campaignId];
        require(campaign.couponsGenerated, "Coupons not generated yet");
        
        uint256[] memory couponIds = qurbanCouponNFT.getCouponsByCampaign(campaignId);
        require(couponIds.length == wargaAddresses.length, "Mismatch coupon and address count");
        
        for (uint256 i = 0; i < couponIds.length; i++) {
            qurbanCouponNFT.assignCoupon(couponIds[i], wargaAddresses[i]);
        }
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
    
    function getCampaignInfo(uint256 campaignId) public view returns (
        uint256 tokenId,
        uint256 targetAmount,
        uint256 collectedAmount,
        uint256 participants,
        uint256 maxParticipants,
        uint256 deadline,
        uint256 claimDeadline,
        bool isCompleted,
        bool isCancelled,
        bool couponsGenerated
    ) {
        QurbanCampaign storage campaign = campaigns[campaignId];
        return (
            campaign.tokenId,
            campaign.targetAmount,
            campaign.collectedAmount,
            campaign.participants,
            campaign.maxParticipants,
            campaign.deadline,
            campaign.claimDeadline,
            campaign.isCompleted,
            campaign.isCancelled,
            campaign.couponsGenerated
        );
    }
    
    function getUserContribution(uint256 campaignId, address user) public view returns (uint256) {
        return campaigns[campaignId].contributions[user];
    }
    
    function getUserParticipations(address user) public view returns (uint256[] memory) {
        return userParticipations[user];
    }
    
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal override whenNotPaused {
        super._update(from, to, ids, values);
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
}