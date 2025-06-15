// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "lib/openzeppelin-contracts/contracts/access/AccessControl.sol";
import "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "lib/openzeppelin-contracts/contracts/utils/Pausable.sol";

/**
 * @title QurbanCouponNFT - ERC721 untuk Kupon Daging
 * @dev NFT yang merepresentasikan kupon daging qurban
 */

contract QurbanCouponNFT is ERC721, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant RT_ROLE = keccak256("RT_ROLE");
    
    struct QurbanCoupon {
        uint256 campaignId;    // ID campaign
        uint256 animalTokenId; // ID NFT hewan yang dipotong
        string animalType;     // "sapi" atau "kambing"
        uint256 portion;       // Porsi daging (1-14 untuk sapi, 1-2 untuk kambing)
        uint256 weightGrams;   // Berat daging dalam gram
        bool isClaimed;        // Status sudah di-claim
        uint256 claimDeadline; // Deadline claim
        string meatQuality;    // Kualitas daging (A, B, C)
    }
    
    mapping(uint256 => QurbanCoupon) public coupons;
    mapping(uint256 => uint256[]) public animalToCoupons; // animalTokenId -> couponTokenIds[]
    mapping(uint256 => uint256[]) public campaignToCoupons; // campaignId -> couponTokenIds[]
    
    uint256 private _nextTokenId = 1;
    
    event CouponMinted(uint256 indexed tokenId, uint256 indexed campaignId, uint256 indexed animalTokenId, address recipient);
    event CouponClaimed(uint256 indexed tokenId, address indexed claimer);
    event CouponAssigned(uint256 indexed tokenId, address indexed newOwner);
    
    constructor() ERC721("QurbanCoupon", "QCPN") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(RT_ROLE, msg.sender);
    }
    
    function mintCouponsFromAnimal(
        uint256 campaignId,
        uint256 animalTokenId,
        string memory animalType,
        uint256 quantity,
        uint256[] memory portionWeights, // Berat setiap porsi dalam gram
        address initialOwner,
        uint256 claimDeadline
    ) public onlyRole(MINTER_ROLE) whenNotPaused returns (uint256[] memory) {
        require(portionWeights.length == quantity, "Weight array mismatch");
        
        uint256[] memory tokenIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(initialOwner, tokenId);
            
            coupons[tokenId] = QurbanCoupon({
                campaignId: campaignId,
                animalTokenId: animalTokenId,
                animalType: animalType,
                portion: i + 1,
                weightGrams: portionWeights[i],
                isClaimed: false,
                claimDeadline: claimDeadline,
                meatQuality: _determineMeatQuality(portionWeights[i])
            });
            
            animalToCoupons[animalTokenId].push(tokenId);
            campaignToCoupons[campaignId].push(tokenId);
            tokenIds[i] = tokenId;
            
            emit CouponMinted(tokenId, campaignId, animalTokenId, initialOwner);
        }
        
        return tokenIds;
    }
    
    function _determineMeatQuality(uint256 weightGrams) private pure returns (string memory) {
        if (weightGrams >= 3000) return "A"; // Grade A untuk >= 3kg
        else if (weightGrams >= 2000) return "B"; // Grade B untuk >= 2kg
        else return "C"; // Grade C untuk < 2kg
    }
    
    function assignCoupon(uint256 tokenId, address newOwner) public {
    // function assignCoupon(uint256 tokenId, address newOwner) public onlyRole(RT_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!coupons[tokenId].isClaimed, "Coupon already claimed");
        
        address currentOwner = ownerOf(tokenId);
        _transfer(currentOwner, newOwner, tokenId);
        
        emit CouponAssigned(tokenId, newOwner);
    }
    
    function claimCoupon(uint256 tokenId) public nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!coupons[tokenId].isClaimed, "Already claimed");
        require(block.timestamp <= coupons[tokenId].claimDeadline, "Claim deadline passed");
        
        coupons[tokenId].isClaimed = true;
        _burn(tokenId);
        
        emit CouponClaimed(tokenId, msg.sender);
    }
    
    function getCouponsByAnimal(uint256 animalTokenId) public view returns (uint256[] memory) {
        return animalToCoupons[animalTokenId];
    }
    
    function getCouponsByCampaign(uint256 campaignId) public view returns (uint256[] memory) {
        return campaignToCoupons[campaignId];
    }
    
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    function _update(address to, uint256 tokenId, address auth) internal override whenNotPaused returns (address) {
        return super._update(to, tokenId, auth);
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        QurbanCoupon memory coupon = coupons[tokenId];
        return string(abi.encodePacked(
            "https://api.qurbanchain.com/coupon/",
            Strings.toString(tokenId),
            "?animal=", coupon.animalType,
            "&portion=", Strings.toString(coupon.portion),
            "&weight=", Strings.toString(coupon.weightGrams),
            "&quality=", coupon.meatQuality
        ));
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}