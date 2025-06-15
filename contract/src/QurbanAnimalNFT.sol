// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "lib/openzeppelin-contracts/contracts/access/AccessControl.sol";
import "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "lib/openzeppelin-contracts/contracts/utils/Pausable.sol";

/**
 * @title QurbanAnimalNFT - ERC721 untuk Hewan Qurban
 * @dev NFT yang merepresentasikan hewan qurban (sapi/kambing)
 */
contract QurbanAnimalNFT is ERC721, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    struct QurbanAnimal {
        uint256 campaignId;     // ID campaign yang membelinya
        string animalType;      // "sapi" atau "kambing"
        uint256 weight;         // Berat hewan (kg)
        string breed;           // Jenis/ras hewan
        uint256 purchaseDate;   // Tanggal pembelian
        bool isSlaughtered;     // Status sudah disembelih
        string certificateHash; // Hash sertifikat halal
        uint256 totalCoupons;   // Total kupon yang akan dihasilkan
    }
    
    mapping(uint256 => QurbanAnimal) public animals;
    mapping(uint256 => uint256) public campaignToAnimal; // campaignId -> animalTokenId
    
    uint256 private _nextTokenId = 1;
    
    event AnimalMinted(uint256 indexed tokenId, uint256 indexed campaignId, string animalType);
    event AnimalSlaughtered(uint256 indexed tokenId, uint256 timestamp);
    
    constructor() ERC721("QurbanAnimal", "QANM") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    function mintAnimal(
        uint256 campaignId,
        string memory animalType,
        uint256 weight,
        string memory breed,
        string memory certificateHash,
        address owner
    ) public onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(owner, tokenId);
        
        uint256 totalCoupons = keccak256(abi.encodePacked(animalType)) == keccak256("sapi") ? 14 : 2;
        
        animals[tokenId] = QurbanAnimal({
            campaignId: campaignId,
            animalType: animalType,
            weight: weight,
            breed: breed,
            purchaseDate: block.timestamp,
            isSlaughtered: false,
            certificateHash: certificateHash,
            totalCoupons: totalCoupons
        });
        
        campaignToAnimal[campaignId] = tokenId;
        
        emit AnimalMinted(tokenId, campaignId, animalType);
        return tokenId;
    }
    
    function markAsSlaughtered(uint256 tokenId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _ownerOf(tokenId) != address(0);
        animals[tokenId].isSlaughtered = true;
        emit AnimalSlaughtered(tokenId, block.timestamp);
    }
    
    function getAnimalByCampaign(uint256 campaignId) public view returns (uint256) {
        return campaignToAnimal[campaignId];
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
        _ownerOf(tokenId) != address(0);
        
        QurbanAnimal memory animal = animals[tokenId];
        return string(abi.encodePacked(
            "https://api.qurbanchain.com/animal/",
            Strings.toString(tokenId),
            "?type=", animal.animalType,
            "&weight=", Strings.toString(animal.weight),
            "&breed=", animal.breed
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
