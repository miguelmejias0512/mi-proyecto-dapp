// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Útil para debugging en desarrollo local
import "hardhat/console.sol";

/**
 * @title InvestmentPool
 * @notice Contrato para gestión de pool de inversión colectiva
 * @dev Sistema completo de depósitos, retiros, propuestas y gestión
 * @author Miguel Moisés Mejías Hernández
 */

contract InvestmentPool is AccessControl, ReentrancyGuard {
    // ============ Roles ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // ============ Estructuras ============
    
    struct Member {
        uint256 balance;           // Balance del miembro en el pool
        uint256 depositedAt;       // Timestamp del último depósito
        bool isActive;             // Estado del miembro
        uint256 depositCounter;    // Contador de depósitos del miembro
    }
    
    struct Proposal {
        uint256 id;                // ID de la propuesta
        string description;        // Descripción de la inversión
        address target;            // Dirección destino de los fondos
        uint256 amount;            // Cantidad a invertir
        address proposer;          // Quien creó la propuesta
        uint256 createdAt;         // Timestamp de creación
        bool executed;             // Si ya fue ejecutada
        ProposalStatus status;     // Estado actual
    }
    
    enum ProposalStatus {
        Pending,    // Pendiente de revisión
        Approved,   // Aprobada para ejecución
        Rejected,   // Rechazada
        Executed    // Ejecutada
    }
    
    // ============ Variables de Estado ============
    
    mapping(address => Member) public members;
    address[] public memberAddresses;
    
    Proposal[] public proposals;
    
    uint256 public totalPoolBalance;
    uint256 public minimumDeposit = 0.01 ether;
    uint256 public proposalCount;

    // Variables adicionales del contrato
    string public greeting = "Building Unstoppable Investment Pools!!!";
    uint256 public totalDepositCounter = 0;
    mapping(address => uint256) public userDepositCounter;
    
    // ============ Eventos ============
    
    event Deposited(
        address indexed member,
        uint256 amount,
        uint256 newBalance,
        uint256 timestamp
    );
    
    event Withdrawn(
        address indexed member,
        uint256 amount,
        uint256 remainingBalance,
        uint256 timestamp
    );
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        address target,
        uint256 amount,
        uint256 timestamp
    );
    
    event ProposalStatusChanged(
        uint256 indexed proposalId,
        ProposalStatus oldStatus,
        ProposalStatus newStatus,
        address changedBy,
        uint256 timestamp
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        address target,
        uint256 amount,
        bool success,
        uint256 timestamp
    );
    
    event MinimumDepositChanged(
        uint256 oldMinimum,
        uint256 newMinimum,
        uint256 timestamp
    );
    
    event AdminAdded(
        address indexed admin,
        address indexed addedBy,
        uint256 timestamp
    );
    
    event AdminRemoved(
        address indexed admin,
        address indexed removedBy,
        uint256 timestamp
    );
    
    event GreetingChange(
        address indexed greetingSetter, 
        string newGreeting, 
        uint256 timestamp
    );
    
    // ============ Errores Personalizados ============
    
    error InsufficientDeposit(uint256 sent, uint256 minimum);
    error InsufficientBalance(uint256 requested, uint256 available);
    error InsufficientPoolFunds(uint256 requested, uint256 available);
    error ProposalAlreadyExecuted(uint256 proposalId);
    error ProposalNotApproved(uint256 proposalId);
    error InvalidProposalId(uint256 proposalId);
    error InvalidAmount(uint256 amount);
    error InvalidAddress(address addr);
    error TransferFailed(address to, uint256 amount);
    error NotMember(address addr);
    
    // ============ Modificadores ============
    
    modifier onlyMember() {
        if (!members[msg.sender].isActive) {
            revert NotMember(msg.sender);
        }
        _;
    }
    
    modifier validProposal(uint256 proposalId) {
        if (proposalId >= proposals.length) {
            revert InvalidProposalId(proposalId);
        }
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // ============ Funciones Principales ============
    
    /**
     * @notice Depositar ETH al pool de inversión
     * @dev El usuario recibe balance proporcional y se convierte en miembro
     */
    function deposit() external payable nonReentrant {
        if (msg.value < minimumDeposit) {
            revert InsufficientDeposit(msg.value, minimumDeposit);
        }
        
        console.log("New deposit from %s of %s wei", msg.sender, msg.value);
        
        // Si es nuevo miembro, agregarlo
        if (!members[msg.sender].isActive) {
            members[msg.sender].isActive = true;
            memberAddresses.push(msg.sender);
        }
        
        // Actualizar balance del miembro
        members[msg.sender].balance += msg.value;
        members[msg.sender].depositedAt = block.timestamp;
        members[msg.sender].depositCounter += 1;
        
        // Actualizar contadores globales
        totalPoolBalance += msg.value;
        totalDepositCounter += 1;
        userDepositCounter[msg.sender] += 1;
        
        // Mintear tokens de gobernanza proporcionales al depósito
        // governanceToken.mint(msg.sender, msg.value);

        emit Deposited(
            msg.sender,
            msg.value,
            members[msg.sender].balance,
            block.timestamp
        );
    }
    
    /**
     * @notice Retirar fondos del pool
     * @param amount Cantidad a retirar en wei
     */
    function withdraw(uint256 amount) external nonReentrant onlyMember {
        if (amount == 0) {
            revert InvalidAmount(amount);
        }
        
        if (amount > members[msg.sender].balance) {
            revert InsufficientBalance(amount, members[msg.sender].balance);
        }
        
        console.log("Withdrawal request from %s for %s wei", msg.sender, amount);
        
        // Actualizar balances
        members[msg.sender].balance -= amount;
        totalPoolBalance -= amount;
        
        // Quemar tokens de gobernanza proporcionales al retiro
        // governanceToken.burn(msg.sender, amount);
        
        // Si el balance llega a 0, desactivar miembro
        if (members[msg.sender].balance == 0) {
            members[msg.sender].isActive = false;
        }
        
        // Transferir fondos
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert TransferFailed(msg.sender, amount);
        }
        
        emit Withdrawn(
            msg.sender,
            amount,
            members[msg.sender].balance,
            block.timestamp
        );
    
    }
    
    /**
     * @notice Crear una nueva propuesta de inversión
     * @param description Descripción de la inversión
     * @param target Dirección destino de los fondos
     * @param amount Cantidad a invertir
     */
    function createProposal(
        string calldata description,
        address target,
        uint256 amount
    ) external onlyMember returns (uint256) {
        if (target == address(0)) {
            revert InvalidAddress(target);
        }
        
        if (amount == 0 || amount > totalPoolBalance) {
            revert InsufficientPoolFunds(amount, totalPoolBalance);
        }
        
        console.log("New proposal created by %s for %s wei", msg.sender, amount);
        
        uint256 proposalId = proposalCount;
        
        Proposal memory newProposal = Proposal({
            id: proposalId,
            description: description,
            target: target,
            amount: amount,
            proposer: msg.sender,
            createdAt: block.timestamp,
            executed: false,
            status: ProposalStatus.Pending
        });
        
        proposals.push(newProposal);
        proposalCount++;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            description,
            target,
            amount,
            block.timestamp
        );
        
        return proposalId;
    }
    
    /**
     * @notice Aprobar una propuesta (solo ADMIN)
     * @param proposalId ID de la propuesta
     */
    function approveProposal(uint256 proposalId) 
        external 
        onlyRole(ADMIN_ROLE) 
        validProposal(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.executed) {
            revert ProposalAlreadyExecuted(proposalId);
        }
        
        ProposalStatus oldStatus = proposal.status;
        proposal.status = ProposalStatus.Approved;
        
        console.log("Proposal %s approved by admin %s", proposalId, msg.sender);
        
        emit ProposalStatusChanged(
            proposalId,
            oldStatus,
            ProposalStatus.Approved,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @notice Rechazar una propuesta (solo ADMIN)
     * @param proposalId ID de la propuesta
     */
    function rejectProposal(uint256 proposalId) 
        external 
        onlyRole(ADMIN_ROLE) 
        validProposal(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.executed) {
            revert ProposalAlreadyExecuted(proposalId);
        }
        
        ProposalStatus oldStatus = proposal.status;
        proposal.status = ProposalStatus.Rejected;
        
        emit ProposalStatusChanged(
            proposalId,
            oldStatus,
            ProposalStatus.Rejected,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @notice Ejecutar una propuesta aprobada (solo ADMIN)
     * @param proposalId ID de la propuesta
     */
    function executeProposal(uint256 proposalId) 
        external 
        onlyRole(ADMIN_ROLE) 
        validProposal(proposalId)
        nonReentrant
    {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.executed) {
            revert ProposalAlreadyExecuted(proposalId);
        }
        
        if (proposal.status != ProposalStatus.Approved) {
            revert ProposalNotApproved(proposalId);
        }
        
        if (proposal.amount > totalPoolBalance) {
            revert InsufficientPoolFunds(proposal.amount, totalPoolBalance);
        }
        
        console.log("Executing proposal %s to %s", proposalId, proposal.target);
        
        // Marcar como ejecutada
        proposal.executed = true;
        proposal.status = ProposalStatus.Executed;
        
        // Actualizar balance del pool
        totalPoolBalance -= proposal.amount;
        
        // Transferir fondos
        (bool success, ) = payable(proposal.target).call{value: proposal.amount}("");
        
        emit ProposalExecuted(
            proposalId,
            proposal.target,
            proposal.amount,
            success,
            block.timestamp
        );
        
        if (!success) {
            // Revertir cambios si falla la transferencia
            totalPoolBalance += proposal.amount;
            proposal.executed = false;
            proposal.status = ProposalStatus.Approved;
            revert TransferFailed(proposal.target, proposal.amount);
        }
    }
    
    // ============ Funciones de Lectura ============
    
    /**
     * @notice Obtener balance total del pool
     */
    function getPoolBalance() external view returns (uint256) {
        return totalPoolBalance;
    }
    
    /**
     * @notice Obtener balance de un miembro específico
     * @param member Dirección del miembro
     */
    function getMemberBalance(address member) external view returns (uint256) {
        return members[member].balance;
    }
    
    /**
     * @notice Obtener información completa de un miembro
     * @param member Dirección del miembro
     */
    function getMemberInfo(address member) external view returns (
        uint256 balance,
        uint256 depositedAt,
        bool isActive,
        uint256 depositCounter
    ) {
        Member memory m = members[member];
        return (m.balance, m.depositedAt, m.isActive, m.depositCounter);
    }
    
    /**
     * @notice Obtener detalles de una propuesta
     * @param proposalId ID de la propuesta
     */
    function getProposal(uint256 proposalId) 
        external 
        view 
        validProposal(proposalId)
        returns (Proposal memory) 
    {
        return proposals[proposalId];
    }
    
    /**
     * @notice Obtener todas las propuestas
     */
    function getAllProposals() external view returns (Proposal[] memory) {
        return proposals;
    }
    
    /**
     * @notice Obtener propuestas activas (Pending y Approved)
     */
    function getActiveProposals() external view returns (Proposal[] memory) {
        uint256 activeCount = 0;
        
        // Contar propuestas activas
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].status == ProposalStatus.Pending || 
                proposals[i].status == ProposalStatus.Approved) {
                activeCount++;
            }
        }
        
        // Crear array de propuestas activas
        Proposal[] memory activeProposals = new Proposal[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].status == ProposalStatus.Pending || 
                proposals[i].status == ProposalStatus.Approved) {
                activeProposals[index] = proposals[i];
                index++;
            }
        }
        
        return activeProposals;
    }
    
    /**
     * @notice Obtener total de miembros activos
     */
    function getTotalMembers() external view returns (uint256) {
        uint256 activeMembers = 0;
        for (uint256 i = 0; i < memberAddresses.length; i++) {
            if (members[memberAddresses[i]].isActive) {
                activeMembers++;
            }
        }
        return activeMembers;
    }
    
    /**
     * @notice Obtener lista de direcciones de miembros activos
     */
    function getActiveMembers() external view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // Contar miembros activos
        for (uint256 i = 0; i < memberAddresses.length; i++) {
            if (members[memberAddresses[i]].isActive) {
                activeCount++;
            }
        }
        
        // Crear array de miembros activos
        address[] memory activeMembers = new address[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < memberAddresses.length; i++) {
            if (members[memberAddresses[i]].isActive) {
                activeMembers[index] = memberAddresses[i];
                index++;
            }
        }
        
        return activeMembers;
    }
    
    /**
     * @notice Verificar si una dirección es miembro activo
     * @param account Dirección a verificar
     */
    function isMember(address account) external view returns (bool) {
        return members[account].isActive;
    }
    
    // ============ Funciones de Administración ============
    
    /**
     * @notice Cambiar el depósito mínimo requerido
     * @param newMinimum Nuevo mínimo en wei
     */
    function setMinimumDeposit(uint256 newMinimum) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        uint256 oldMinimum = minimumDeposit;
        minimumDeposit = newMinimum;
        
        emit MinimumDepositChanged(oldMinimum, newMinimum, block.timestamp);
    }
    
    /**
     * @notice Agregar un nuevo administrador
     * @param newAdmin Dirección del nuevo administrador
     * @dev Solo el DEFAULT_ADMIN_ROLE puede llamar esto
     */
    function addAdmin(address newAdmin) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(newAdmin != address(0), "Invalid address");
        grantRole(ADMIN_ROLE, newAdmin);
        
        emit AdminAdded(newAdmin, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Remover un administrador
     * @param admin Dirección del administrador a remover
     * @dev Solo el DEFAULT_ADMIN_ROLE puede llamar esto
     */
    function removeAdmin(address admin) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(admin != address(0), "Invalid address");
        require(admin != msg.sender, "Cannot remove yourself");
        revokeRole(ADMIN_ROLE, admin);
        
        emit AdminRemoved(admin, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Verificar si una dirección es administrador
     * @param account Dirección a verificar
     */
    function isAdmin(address account) external view returns (bool) {
        return hasRole(ADMIN_ROLE, account);
    }
    
    /**
     * @notice Obtener el rol de DEFAULT_ADMIN
     */
    function getDefaultAdminRole() external pure returns (bytes32) {
        return DEFAULT_ADMIN_ROLE;
    }
    
    /**
     * @notice Cambiar el mensaje de saludo
     * @param _newGreeting Nuevo mensaje de saludo
     */
    function setGreeting(string memory _newGreeting) external onlyRole(ADMIN_ROLE) {
        console.log("Setting new greeting '%s' from %s", _newGreeting, msg.sender);
        
        greeting = _newGreeting;
        
        emit GreetingChange(msg.sender, _newGreeting, block.timestamp);
    }
    
    // ============ Funciones de Utilidad ============
    
    /**
     * @notice Obtener balance del contrato
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Función para recibir ETH directo
     */
    receive() external payable {
        totalPoolBalance += msg.value;
        console.log("Direct ETH received: %s wei", msg.value);
    }
    
    /**
     * @notice Fallback function
     */
    fallback() external payable {
        revert("Use deposit() function");
    }

}
