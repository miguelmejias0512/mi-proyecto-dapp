"use client";
import Link from "next/link";
import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

// import { TokenBalance } from "~~/components/investment-pool/TokenBalance";
// import { VotingSection } from "~~/components/investment-pool/VotingSection";
// import { VotingAdminPanel } from "~~/components/investment-pool/VotingAdminPanel";


import { DepositSection } from "~~/components/investment-pool/DepositSection";
import { WithdrawSection } from "~~/components/investment-pool/WithdrawSection";
import { ProposalSection } from "~~/components/investment-pool/ProposalSection";
import { AdminSection } from "~~/components/investment-pool/AdminSection";
import { PoolStats } from "~~/components/investment-pool/PoolStats";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { AdminManagement } from "~~/components/investment-pool/AdminManagement";



export default function Home() {
// const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
// Agregar | "tokens" | "voting" al final
const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "proposals" | "admin" | "manage-admins" | "tokens" | "voting">("deposit");
// Verificar si el usuario conectado es admin
// Hash de keccak256("ADMIN_ROLE") calculado previamente
  const ADMIN_ROLE = "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775" as `0x${string}`;
  const { data: isAdmin } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "hasRole",
    args: [ADMIN_ROLE, connectedAddress],
  });

  const { data: isMember } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "isMember",
    args: [connectedAddress],
  });

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-7xl">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">Pool de Inversión Colectiva</span>
          <span className="block text-2xl mt-2">Gestiona tus inversiones de forma colaborativa</span>
        </h1>

        {/* Información del usuario conectado */}
        {connectedAddress && (
          <div className="bg-base-200 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="text-center mb-8">
                <p className="text-sm text-gray-500 mb-1">Tu dirección:</p>
                <Address address={connectedAddress} />
              </div>
              <div className="flex gap-2">
                {isMember && (
                  <div className="badge badge-success gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="inline-block w-4 h-4 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    Miembro Activo
                  </div>
                )}
                {isAdmin && (
                  <div className="badge badge-primary gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="inline-block w-4 h-4 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      ></path>
                    </svg>
                    Administrador
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas del Pool */}
        <PoolStats />

        {/* Tabs de navegación */}
        <div className="tabs tabs-boxed mb-6 justify-center">
          <button
            className={`tab tab-lg ${activeTab === "deposit" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("deposit")}
          >
            💰 Depositar
          </button>
          <button
            className={`tab tab-lg ${activeTab === "withdraw" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("withdraw")}
            disabled={!isMember}
          >
            💸 Retirar
          </button>
          <button
            className={`tab tab-lg ${activeTab === "proposals" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("proposals")}
          >
            📋 Propuestas
          </button>
          {isAdmin && (
            <button
              className={`tab tab-lg ${activeTab === "admin" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("admin")}
            >
              ⚙️ Administración
            </button>
          )}
          {isAdmin && (
              <button
                className={`tab tab-lg ${activeTab === "manage-admins" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("manage-admins")}
              >
                👥 Gestión Admins
              </button>
            )}
          {/* {isMember && (
            <button className={`tab ${activeTab === "tokens" ? "tab-active" : ""}`}>
              💎 Mis Tokens
            </button>
          )}
          {isMember && (
            <button className={`tab ${activeTab === "voting" ? "tab-active" : ""}`}>
              🗳️ Votaciones
            </button>
          )}           */}

        </div>

        {/* Contenido de las tabs */}
        <div className="mb-8">
          {activeTab === "deposit" && <DepositSection />}
          {activeTab === "withdraw" && <WithdrawSection />}
          {activeTab === "proposals" && <ProposalSection isMember={!!isMember} />}
          {activeTab === "admin" && isAdmin && <AdminSection />}
          {activeTab === "manage-admins" && isAdmin && <AdminManagement />}
          {/* {activeTab === "tokens" && <TokenBalance />}
          {activeTab === "voting" && <VotingSection isMember={!!isMember} />} */}
        </div>

        {/* Footer informativo */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Pool de Inversión Colectiva v1.0</p>
          <p className="mt-2">
            Desarrollado con{" "}
            <a href="https://scaffoldeth.io/" target="_blank" rel="noreferrer" className="link">
              🏗 Scaffold-ETH 2
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
