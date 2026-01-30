"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface VotingSectionProps {
  isMember: boolean;
}

export const VotingSection = ({ isMember }: VotingSectionProps) => {
  const { address: connectedAddress } = useAccount();
  const [selectedVote, setSelectedVote] = useState<number | null>(null);

  // Leer cantidad de votaciones
  const { data: voteCount } = useScaffoldReadContract({
    contractName: "VotingSystem",
    functionName: "voteCount",
  });

  // Leer configuración de votación
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

  // Leer poder de voto del usuario
  const { data: votingPower } = useScaffoldReadContract({
    contractName: "PoolInvestmentToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { writeContractAsync: castVote, isPending: isVoting } = useScaffoldWriteContract("VotingSystem");

  const handleVote = async (voteId: number, support: boolean) => {
    try {
      await castVote({
        functionName: "castVote",
        args: [BigInt(voteId), support],
      });
      alert(`✅ Voto ${support ? "a favor" : "en contra"} registrado exitosamente`);
    } catch (error: any) {
      console.error("Error al votar:", error);
      if (error.message?.includes("Already voted")) {
        alert("⚠️ Ya has votado en esta propuesta");
      } else if (error.message?.includes("No voting power")) {
        alert("⚠️ No tienes tokens para votar. Deposita primero.");
      } else {
        alert("❌ Error al votar. Verifica la consola para más detalles.");
      }
    }
  };

  if (!isMember) {
    return (
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
          <h3 className="font-bold">Debes ser miembro para votar</h3>
          <div className="text-xs">Deposita fondos en el pool para convertirte en miembro y poder votar</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información de votación */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">
            🗳️ Sistema de Votación
            <div className="badge badge-primary">Democrático</div>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Tu Poder de Voto</div>
              <div className="stat-value text-primary text-2xl">
                {votingPower ? formatEther(votingPower) : "0"}
              </div>
              <div className="stat-desc">PIT tokens = votos</div>
            </div>

            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Período de Votación</div>
              <div className="stat-value text-secondary text-2xl">
                {votingPeriod ? Number(votingPeriod) / 86400 : 0}
              </div>
              <div className="stat-desc">días para votar</div>
            </div>

            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Quórum / Aprobación</div>
              <div className="stat-value text-accent text-2xl">
                {quorumPercentage?.toString() || "0"}% / {approvalPercentage?.toString() || "0"}%
              </div>
              <div className="stat-desc">necesario para aprobar</div>
            </div>
          </div>

          <div className="alert alert-info mt-4">
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
              <h3 className="font-bold">¿Cómo funciona la votación?</h3>
              <div className="text-xs mt-1">
                <p>• Tu voto tiene peso según tus tokens PIT (1 token = 1 voto)</p>
                <p>• Se necesita {quorumPercentage?.toString() || "30"}% de participación (quórum)</p>
                <p>• Se necesita {approvalPercentage?.toString() || "50"}% de votos a favor para aprobar</p>
                <p>• Tienes {votingPeriod ? Number(votingPeriod) / 86400 : 7} días para votar en cada propuesta</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de votaciones activas */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">📋 Votaciones Activas</h2>

          {voteCount && Number(voteCount) > 0 ? (
            <div className="space-y-4 mt-4">
              {Array.from({ length: Number(voteCount) }, (_, i) => (
                <VoteCard
                  key={i}
                  voteId={i}
                  onVote={handleVote}
                  isVoting={isVoting}
                  userAddress={connectedAddress}
                />
              ))}
            </div>
          ) : (
            <div className="alert">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-info shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>No hay votaciones activas en este momento</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para cada tarjeta de votación
interface VoteCardProps {
  voteId: number;
  onVote: (voteId: number, support: boolean) => void;
  isVoting: boolean;
  userAddress?: string;
}

const VoteCard = ({ voteId, onVote, isVoting, userAddress }: VoteCardProps) => {
  // Leer resultado de la votación
  const { data: voteResult } = useScaffoldReadContract({
    contractName: "VotingSystem",
    functionName: "getVoteResult",
    args: [BigInt(voteId)],
  });

  // Verificar si el usuario ya votó
  const { data: hasVoted } = useScaffoldReadContract({
    contractName: "VotingSystem",
    functionName: "hasVoted",
    args: [BigInt(voteId), userAddress],
  });

  // Leer tiempo restante
  const { data: timeRemaining } = useScaffoldReadContract({
    contractName: "VotingSystem",
    functionName: "getTimeRemaining",
    args: [BigInt(voteId)],
  });

  if (!voteResult) return null;

  const [status, votesFor, votesAgainst, totalVotes, reachedQuorum, passed] = voteResult;

  const votesForPercent = totalVotes > 0n 
    ? (Number(votesFor) / Number(totalVotes) * 100).toFixed(1)
    : "0";
  
  const votesAgainstPercent = totalVotes > 0n
    ? (Number(votesAgainst) / Number(totalVotes) * 100).toFixed(1)
    : "0";

  const daysRemaining = timeRemaining ? Math.ceil(Number(timeRemaining) / 86400) : 0;
  const hoursRemaining = timeRemaining ? Math.ceil(Number(timeRemaining) / 3600) : 0;

  const statusBadge = {
    0: { text: "Activa", color: "badge-success" },
    1: { text: "Aprobada", color: "badge-primary" },
    2: { text: "Rechazada", color: "badge-error" },
    3: { text: "Cancelada", color: "badge-ghost" },
    4: { text: "Expirada", color: "badge-warning" },
  }[status] || { text: "Desconocida", color: "badge-ghost" };

  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="card-title">Votación #{voteId}</h3>
            <p className="text-sm text-gray-500">ID de Propuesta: {voteId}</p>
          </div>
          <div className={`badge ${statusBadge.color} badge-lg`}>
            {statusBadge.text}
          </div>
        </div>

        {/* Progreso de votación */}
        <div className="mt-4 space-y-2">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>✅ A Favor ({votesForPercent}%)</span>
              <span>{formatEther(votesFor)} votos</span>
            </div>
            <progress
              className="progress progress-success w-full"
              value={Number(votesFor)}
              max={Number(totalVotes) || 1}
            ></progress>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>❌ En Contra ({votesAgainstPercent}%)</span>
              <span>{formatEther(votesAgainst)} votos</span>
            </div>
            <progress
              className="progress progress-error w-full"
              value={Number(votesAgainst)}
              max={Number(totalVotes) || 1}
            ></progress>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-base-100 rounded p-3">
            <p className="text-xs text-gray-500">Total de Votos</p>
            <p className="font-bold">{formatEther(totalVotes)}</p>
          </div>
          <div className="bg-base-100 rounded p-3">
            <p className="text-xs text-gray-500">Tiempo Restante</p>
            <p className="font-bold">
              {daysRemaining > 0 ? `${daysRemaining} días` : `${hoursRemaining} horas`}
            </p>
          </div>
          <div className="bg-base-100 rounded p-3">
            <p className="text-xs text-gray-500">Quórum Alcanzado</p>
            <p className="font-bold">{reachedQuorum ? "✅ Sí" : "❌ No"}</p>
          </div>
          <div className="bg-base-100 rounded p-3">
            <p className="text-xs text-gray-500">Estado</p>
            <p className="font-bold">{passed ? "✅ Aprobada" : "❌ Rechazada"}</p>
          </div>
        </div>

        {/* Botones de votación */}
        {status === 0 && !hasVoted && (
          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-error"
              onClick={() => onVote(voteId, false)}
              disabled={isVoting}
            >
              {isVoting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "❌ Votar en Contra"
              )}
            </button>
            <button
              className="btn btn-success"
              onClick={() => onVote(voteId, true)}
              disabled={isVoting}
            >
              {isVoting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "✅ Votar a Favor"
              )}
            </button>
          </div>
        )}

        {hasVoted && (
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
            <span>Ya has votado en esta propuesta</span>
          </div>
        )}
      </div>
    </div>
  );
};
