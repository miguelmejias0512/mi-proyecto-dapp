"use client";

import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const PoolStats = () => {
  const { data: poolBalance } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "getPoolBalance",
  });

  const { data: totalMembers } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "getTotalMembers",
  });

  const { data: proposalCount } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "proposalCount",
  });

  const { data: minimumDeposit } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "minimumDeposit",
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Balance Total del Pool */}
      <div className="stat bg-primary text-primary-content rounded-lg shadow-lg">
        <div className="stat-figure text-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <div className="stat-title text-primary-content opacity-80">Balance Total</div>
        <div className="stat-value">{poolBalance ? `${Number(formatEther(poolBalance)).toFixed(4)}` : "0"}</div>
        <div className="stat-desc text-primary-content opacity-70">ETH en el pool</div>
      </div>

      {/* Total de Miembros */}
      <div className="stat bg-secondary text-secondary-content rounded-lg shadow-lg">
        <div className="stat-figure text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
        </div>
        <div className="stat-title text-secondary-content opacity-80">Miembros Activos</div>
        <div className="stat-value">{totalMembers?.toString() || "0"}</div>
        <div className="stat-desc text-secondary-content opacity-70">Inversionistas</div>
      </div>

      {/* Total de Propuestas */}
      <div className="stat bg-accent text-accent-content rounded-lg shadow-lg">
        <div className="stat-figure text-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
        </div>
        <div className="stat-title text-accent-content opacity-80">Propuestas Totales</div>
        <div className="stat-value">{proposalCount?.toString() || "0"}</div>
        <div className="stat-desc text-accent-content opacity-70">Inversiones propuestas</div>
      </div>

      {/* Depósito Mínimo */}
      <div className="stat bg-base-300 rounded-lg shadow-lg">
        <div className="stat-figure text-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            ></path>
          </svg>
        </div>
        <div className="stat-title">Depósito Mínimo</div>
        <div className="stat-value text-primary">
          {minimumDeposit ? Number(formatEther(minimumDeposit)).toFixed(4) : "0.01"}
        </div>
        <div className="stat-desc">ETH requerido</div>
      </div>
    </div>
  );
};
