"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { Address } from "@scaffold-ui/components";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ProposalSectionProps {
  isMember: boolean;
}

export const ProposalSection = ({ isMember }: ProposalSectionProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [description, setDescription] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [amount, setAmount] = useState("");

  const { data: allProposals, refetch: refetchProposals } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "getAllProposals",
  });

  const { data: poolBalance } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "getPoolBalance",
  });

  const { writeContractAsync: createProposal, isPending: isCreatingProposal } =
    useScaffoldWriteContract("InvestmentPool");

  const handleCreateProposal = async () => {
    if (!description || !targetAddress || !amount) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      await createProposal({
        functionName: "createProposal",
        args: [description, targetAddress, parseEther(amount)],
      });
      setDescription("");
      setTargetAddress("");
      setAmount("");
      setShowCreateForm(false);
      refetchProposals();
    } catch (error) {
      console.error("Error al crear propuesta:", error);
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

  return (
    <div className="space-y-6">
      {/* Encabezado y botón de crear */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="card-title text-2xl">
                📋 Propuestas de Inversión
                {allProposals && <div className="badge badge-neutral">{allProposals.length} total</div>}
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Aquí puedes ver todas las propuestas de inversión y crear nuevas si eres miembro activo.
              </p>
            </div>
            {isMember && (
              <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
                {showCreateForm ? "❌ Cancelar" : "➕ Nueva Propuesta"}
              </button>
            )}
          </div>

          {/* Formulario de creación */}
          {showCreateForm && (
            <div className="mt-6 bg-base-200 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Crear Nueva Propuesta</h3>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Descripción de la inversión</span>
                </label>
                <textarea
                  placeholder="Ej: Invertir en protocolo DeFi ABC para obtener 15% APY"
                  className="textarea textarea-bordered h-24"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Dirección destino</span>
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  className="input input-bordered"
                  value={targetAddress}
                  onChange={e => setTargetAddress(e.target.value)}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Cantidad (ETH)</span>
                  <span className="label-text-alt">
                    Disponible en pool:{" "}
                    <span className="font-bold">{poolBalance ? Number(formatEther(poolBalance)).toFixed(4) : "0"}</span>{" "}
                    ETH
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="0.0"
                  className="input input-bordered"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  step="0.01"
                />
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={handleCreateProposal}
                disabled={isCreatingProposal || !description || !targetAddress || !amount}
              >
                {isCreatingProposal ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Creando...
                  </>
                ) : (
                  "Crear Propuesta"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lista de propuestas */}
      {!isMember && (
        <div className="alert alert-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="font-bold">No eres miembro activo</h3>
            <div className="text-sm">Debes depositar fondos para poder crear propuestas de inversión.</div>
          </div>
        </div>
      )}

      {allProposals && allProposals.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {[...allProposals].reverse().map((proposal, index) => (
            <div key={index} className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="card-title text-lg">Propuesta #{proposal.id.toString()}</h3>
                      {getStatusBadge(proposal.status)}
                      {proposal.executed && <div className="badge badge-success">✓ Ejecutada</div>}
                    </div>
                    <p className="text-gray-600 mb-4">{proposal.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Monto solicitado</p>
                    <p className="font-bold text-lg text-primary">{formatEther(proposal.amount)} ETH</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dirección destino</p>
                    <Address address={proposal.target} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Propuesta por</p>
                    <Address address={proposal.proposer} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de creación</p>
                    <p className="font-semibold">{formatDate(proposal.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-16 h-16 stroke-gray-400 mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <h3 className="text-xl font-bold">No hay propuestas aún</h3>
            <p className="text-gray-500">
              {isMember
                ? "Sé el primero en crear una propuesta de inversión"
                : "Conviértete en miembro para crear propuestas"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
