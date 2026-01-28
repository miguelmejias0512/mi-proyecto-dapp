"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { Address } from "@scaffold-ui/components";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const AdminSection = () => {
  const [newMinimumDeposit, setNewMinimumDeposit] = useState("");
  const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null);

  const { data: allProposals, refetch: refetchProposals } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "getAllProposals",
  });

  const { data: activeMembers } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "getActiveMembers",
  });

  const { data: minimumDeposit } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "minimumDeposit",
  });

  const { writeContractAsync: setMinimumDeposit, isPending: isSettingMinimum } =
    useScaffoldWriteContract("InvestmentPool");
  const { writeContractAsync: approveProposal, isPending: isApproving } = useScaffoldWriteContract("InvestmentPool");
  const { writeContractAsync: rejectProposal, isPending: isRejecting } = useScaffoldWriteContract("InvestmentPool");
  const { writeContractAsync: executeProposal, isPending: isExecuting } = useScaffoldWriteContract("InvestmentPool");

  const handleSetMinimumDeposit = async () => {
    if (!newMinimumDeposit) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    try {
      await setMinimumDeposit({
        functionName: "setMinimumDeposit",
        args: [parseEther(newMinimumDeposit)],
      });
      setNewMinimumDeposit("");
    } catch (error) {
      console.error("Error al cambiar depósito mínimo:", error);
    }
  };

  const handleApproveProposal = async (proposalId: number) => {
    try {
      await approveProposal({
        functionName: "approveProposal",
        args: [BigInt(proposalId)],
      });
      refetchProposals();
    } catch (error) {
      console.error("Error al aprobar propuesta:", error);
    }
  };

  const handleRejectProposal = async (proposalId: number) => {
    try {
      await rejectProposal({
        functionName: "rejectProposal",
        args: [BigInt(proposalId)],
      });
      refetchProposals();
    } catch (error) {
      console.error("Error al rechazar propuesta:", error);
    }
  };

  const handleExecuteProposal = async (proposalId: number) => {
    try {
      await executeProposal({
        functionName: "executeProposal",
        args: [BigInt(proposalId)],
      });
      refetchProposals();
    } catch (error) {
      console.error("Error al ejecutar propuesta:", error);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <div className="badge badge-warning">Pendiente</div>;
      case 1:
        return <div className="badge badge-info">Aprobada</div>;
      case 2:
        return <div className="badge badge-error">Rechazada</div>;
      case 3:
        return <div className="badge badge-success">Ejecutada</div>;
      default:
        return <div className="badge">Desconocido</div>;
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingProposals = allProposals?.filter(p => p.status === 0 && !p.executed) || [];
  const approvedProposals = allProposals?.filter(p => p.status === 1 && !p.executed) || [];

  return (
    <div className="space-y-6">
      {/* Panel de configuración */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            ⚙️ Configuración del Pool
            <div className="badge badge-primary">Admin</div>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cambiar depósito mínimo */}
            <div>
              <h3 className="font-bold mb-3">Depósito Mínimo</h3>
              <div className="bg-base-200 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-500">Valor actual</p>
                <p className="text-2xl font-bold text-primary">
                  {minimumDeposit ? Number(formatEther(minimumDeposit)).toFixed(4) : "0.01"} ETH
                </p>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nuevo mínimo (ETH)</span>
                </label>
                <div className="join">
                  <input
                    type="number"
                    placeholder="0.01"
                    className="input input-bordered join-item flex-1"
                    value={newMinimumDeposit}
                    onChange={e => setNewMinimumDeposit(e.target.value)}
                    step="0.001"
                  />
                  <button
                    className="btn btn-primary join-item"
                    onClick={handleSetMinimumDeposit}
                    disabled={isSettingMinimum || !newMinimumDeposit}
                  >
                    {isSettingMinimum ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de miembros activos */}
            <div>
              <h3 className="font-bold mb-3">
                Miembros Activos
                {activeMembers && <span className="badge badge-secondary ml-2">{activeMembers.length}</span>}
              </h3>
              <div className="bg-base-200 p-4 rounded-lg max-h-64 overflow-y-auto">
                {activeMembers && activeMembers.length > 0 ? (
                  <div className="space-y-2">
                    {activeMembers.map((member, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-base-100 rounded">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <Address address={member} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">No hay miembros activos aún</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Propuestas pendientes */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            ⏳ Propuestas Pendientes
            {pendingProposals.length > 0 && <div className="badge badge-warning">{pendingProposals.length}</div>}
          </h2>

          {pendingProposals.length > 0 ? (
            <div className="space-y-4">
              {pendingProposals.map(proposal => (
                <div key={Number(proposal.id)} className="bg-base-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">Propuesta #{proposal.id.toString()}</h3>
                        {getStatusBadge(proposal.status)}
                      </div>
                      <p className="text-gray-600 mb-2">{proposal.description}</p>
                      <div className="text-sm text-gray-500">
                        Creada el {formatDate(proposal.createdAt)} por <Address address={proposal.proposer} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Monto</p>
                      <p className="font-bold text-primary text-lg">{formatEther(proposal.amount)} ETH</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Destino</p>
                      <Address address={proposal.target} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="btn btn-success flex-1"
                      onClick={() => handleApproveProposal(Number(proposal.id))}
                      disabled={isApproving}
                    >
                      {isApproving ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Aprobando...
                        </>
                      ) : (
                        <>✓ Aprobar</>
                      )}
                    </button>
                    <button
                      className="btn btn-error flex-1"
                      onClick={() => handleRejectProposal(Number(proposal.id))}
                      disabled={isRejecting}
                    >
                      {isRejecting ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Rechazando...
                        </>
                      ) : (
                        <>✗ Rechazar</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-16 h-16 stroke-current mx-auto mb-4 opacity-50"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p>No hay propuestas pendientes de revisión</p>
            </div>
          )}
        </div>
      </div>

      {/* Propuestas aprobadas (listas para ejecutar) */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            ✅ Propuestas Aprobadas (Listas para Ejecutar)
            {approvedProposals.length > 0 && <div className="badge badge-info">{approvedProposals.length}</div>}
          </h2>

          {approvedProposals.length > 0 ? (
            <div className="space-y-4">
              {approvedProposals.map(proposal => (
                <div key={Number(proposal.id)} className="bg-base-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">Propuesta #{proposal.id.toString()}</h3>
                        {getStatusBadge(proposal.status)}
                      </div>
                      <p className="text-gray-600 mb-2">{proposal.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Monto</p>
                      <p className="font-bold text-primary text-lg">{formatEther(proposal.amount)} ETH</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Destino</p>
                      <Address address={proposal.target} />
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-full"
                    onClick={() => handleExecuteProposal(Number(proposal.id))}
                    disabled={isExecuting}
                  >
                    {isExecuting ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Ejecutando...
                      </>
                    ) : (
                      <>🚀 Ejecutar Propuesta</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-16 h-16 stroke-current mx-auto mb-4 opacity-50"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p>No hay propuestas aprobadas pendientes de ejecución</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
