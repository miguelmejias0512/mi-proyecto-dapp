"use client";

import { useState } from "react";
import { parseEther, formatEther } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const VotingAdminPanel = () => {
  const [proposalIdToVote, setProposalIdToVote] = useState("");
  const [voteIdToFinalize, setVoteIdToFinalize] = useState("");
  const [voteIdToCancel, setVoteIdToCancel] = useState("");
  
  // Configuración de votación
  const [newVotingPeriod, setNewVotingPeriod] = useState("7");
  const [newQuorum, setNewQuorum] = useState("30");
  const [newApproval, setNewApproval] = useState("50");

  // Leer configuración actual
  const { data: votingPeriod } = useScaffoldReadContract({
    contractName: "VotingSystem",
    functionName: "votingPeriod",
  });

  const { data: quorumPercentage } = useScaffoldReadContract({
    contractName: "VotingSystem",
    functionName: "quorumPercentage",
  });

  const { data: approvalPercentage } = useScaffoldReadContract({
    contractName: "VotingSystem",
    functionName: "approvalPercentage",
  });

  const { data: voteCount } = useScaffoldReadContract({
    contractName: "VotingSystem",
    functionName: "voteCount",
  });

  // Funciones de escritura
  const { writeContractAsync: createVote, isPending: isCreating } = useScaffoldWriteContract("VotingSystem");
  const { writeContractAsync: finalizeVote, isPending: isFinalizing } = useScaffoldWriteContract("VotingSystem");
  const { writeContractAsync: cancelVote, isPending: isCancelling } = useScaffoldWriteContract("VotingSystem");
  const { writeContractAsync: updateConfig, isPending: isUpdating } = useScaffoldWriteContract("VotingSystem");

  const handleCreateVote = async () => {
    if (!proposalIdToVote) {
      alert("Por favor ingresa un ID de propuesta válido");
      return;
    }

    try {
      await createVote({
        functionName: "createVote",
        args: [BigInt(proposalIdToVote)],
      });
      alert(`✅ Votación creada para la propuesta #${proposalIdToVote}`);
      setProposalIdToVote("");
    } catch (error) {
      console.error("Error al crear votación:", error);
      alert("❌ Error al crear votación");
    }
  };

  const handleFinalizeVote = async () => {
    if (!voteIdToFinalize) {
      alert("Por favor ingresa un ID de votación válido");
      return;
    }

    try {
      await finalizeVote({
        functionName: "finalizeVote",
        args: [BigInt(voteIdToFinalize)],
      });
      alert(`✅ Votación #${voteIdToFinalize} finalizada`);
      setVoteIdToFinalize("");
    } catch (error: any) {
      console.error("Error al finalizar:", error);
      if (error.message?.includes("Voting period not ended")) {
        alert("⚠️ El período de votación aún no ha terminado");
      } else {
        alert("❌ Error al finalizar votación");
      }
    }
  };

  const handleCancelVote = async () => {
    if (!voteIdToCancel) {
      alert("Por favor ingresa un ID de votación válido");
      return;
    }

    if (!confirm(`¿Estás seguro de cancelar la votación #${voteIdToCancel}? Esta acción no se puede revertir.`)) {
      return;
    }

    try {
      await cancelVote({
        functionName: "cancelVote",
        args: [BigInt(voteIdToCancel)],
      });
      alert(`✅ Votación #${voteIdToCancel} cancelada`);
      setVoteIdToCancel("");
    } catch (error) {
      console.error("Error al cancelar:", error);
      alert("❌ Error al cancelar votación");
    }
  };

  const handleUpdateConfig = async () => {
    const periodDays = parseInt(newVotingPeriod);
    const quorum = parseInt(newQuorum);
    const approval = parseInt(newApproval);

    if (periodDays < 1 || periodDays > 30) {
      alert("El período debe estar entre 1 y 30 días");
      return;
    }

    if (quorum < 0 || quorum > 100) {
      alert("El quórum debe estar entre 0 y 100%");
      return;
    }

    if (approval < 1 || approval > 100) {
      alert("La aprobación debe estar entre 1 y 100%");
      return;
    }

    try {
      await updateConfig({
        functionName: "updateVotingConfig",
        args: [
          BigInt(periodDays * 86400), // días a segundos
          BigInt(quorum),
          BigInt(approval),
        ],
      });
      alert("✅ Configuración actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("❌ Error al actualizar configuración");
    }
  };

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">
            🗳️ Panel de Administración de Votaciones
            <div className="badge badge-warning">Admin</div>
          </h2>

          {/* Configuración actual */}
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h3 className="font-bold">Configuración Actual</h3>
              <div className="text-xs">
                <p>Período: {votingPeriod ? Number(votingPeriod) / 86400 : 0} días</p>
                <p>Quórum: {quorumPercentage?.toString() || "0"}%</p>
                <p>Aprobación: {approvalPercentage?.toString() || "0"}%</p>
                <p>Total de votaciones: {voteCount?.toString() || "0"}</p>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* Crear Votación */}
          <div>
            <h3 className="font-bold text-lg mb-3">➕ Crear Nueva Votación</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">ID de Propuesta</span>
              </label>
              <div className="join">
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered join-item flex-1"
                  value={proposalIdToVote}
                  onChange={e => setProposalIdToVote(e.target.value)}
                  min="0"
                />
                <button
                  className="btn btn-primary join-item"
                  onClick={handleCreateVote}
                  disabled={isCreating || !proposalIdToVote}
                >
                  {isCreating ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Creando...
                    </>
                  ) : (
                    "Crear Votación"
                  )}
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt">
                  Crea una votación para una propuesta existente
                </span>
              </label>
            </div>

            <div className="alert alert-success mt-4">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-xs">
                Al crear una votación, los miembros tendrán {votingPeriod ? Number(votingPeriod) / 86400 : 7} días
                para votar. La votación se aprobará si alcanza {quorumPercentage?.toString() || "30"}% de participación
                y más del {approvalPercentage?.toString() || "50"}% vota a favor.
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* Finalizar Votación */}
          <div>
            <h3 className="font-bold text-lg mb-3">✅ Finalizar Votación</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">ID de Votación</span>
              </label>
              <div className="join">
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered join-item flex-1"
                  value={voteIdToFinalize}
                  onChange={e => setVoteIdToFinalize(e.target.value)}
                  min="0"
                />
                <button
                  className="btn btn-success join-item"
                  onClick={handleFinalizeVote}
                  disabled={isFinalizing || !voteIdToFinalize}
                >
                  {isFinalizing ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Finalizando...
                    </>
                  ) : (
                    "Finalizar"
                  )}
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt">
                  Solo se puede finalizar después de que termine el período de votación
                </span>
              </label>
            </div>
          </div>

          <div className="divider"></div>

          {/* Cancelar Votación */}
          <div>
            <h3 className="font-bold text-lg mb-3">❌ Cancelar Votación</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">ID de Votación</span>
              </label>
              <div className="join">
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered join-item flex-1"
                  value={voteIdToCancel}
                  onChange={e => setVoteIdToCancel(e.target.value)}
                  min="0"
                />
                <button
                  className="btn btn-error join-item"
                  onClick={handleCancelVote}
                  disabled={isCancelling || !voteIdToCancel}
                >
                  {isCancelling ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Cancelando...
                    </>
                  ) : (
                    "Cancelar Votación"
                  )}
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt text-error">
                  ⚠️ Esta acción es irreversible
                </span>
              </label>
            </div>
          </div>

          <div className="divider"></div>

          {/* Actualizar Configuración */}
          <div>
            <h3 className="font-bold text-lg mb-3">⚙️ Actualizar Configuración</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Período (días)</span>
                </label>
                <input
                  type="number"
                  placeholder="7"
                  className="input input-bordered"
                  value={newVotingPeriod}
                  onChange={e => setNewVotingPeriod(e.target.value)}
                  min="1"
                  max="30"
                />
                <label className="label">
                  <span className="label-text-alt">1-30 días</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Quórum (%)</span>
                </label>
                <input
                  type="number"
                  placeholder="30"
                  className="input input-bordered"
                  value={newQuorum}
                  onChange={e => setNewQuorum(e.target.value)}
                  min="0"
                  max="100"
                />
                <label className="label">
                  <span className="label-text-alt">0-100%</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Aprobación (%)</span>
                </label>
                <input
                  type="number"
                  placeholder="50"
                  className="input input-bordered"
                  value={newApproval}
                  onChange={e => setNewApproval(e.target.value)}
                  min="1"
                  max="100"
                />
                <label className="label">
                  <span className="label-text-alt">1-100%</span>
                </label>
              </div>
            </div>

            <button
              className="btn btn-secondary w-full mt-4"
              onClick={handleUpdateConfig}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Actualizando...
                </>
              ) : (
                "Actualizar Configuración"
              )}
            </button>

            <div className="alert alert-warning mt-4">
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
              <div className="text-xs">
                Los cambios solo afectarán a las nuevas votaciones, no a las existentes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="font-bold">📚 Guía de Administración</h3>
          <div className="text-sm space-y-2">
            <p><strong>1. Crear Votación:</strong> Para cada propuesta creada, debes crear una votación separada</p>
            <p><strong>2. Período de Votación:</strong> Los miembros tienen X días para votar</p>
            <p><strong>3. Quórum:</strong> % mínimo de tokens que deben participar</p>
            <p><strong>4. Aprobación:</strong> % de votos a favor necesario (del total que votó)</p>
            <p><strong>5. Finalizar:</strong> Después del período, cualquiera puede finalizar para ver el resultado</p>
            <p><strong>6. Cancelar:</strong> Solo en emergencias, cancela la votación</p>
          </div>
        </div>
      </div>
    </div>
  );
};
