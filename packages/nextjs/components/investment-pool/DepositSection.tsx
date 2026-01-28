"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "@scaffold-ui/components";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const DepositSection = () => {
  const { address: connectedAddress } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");

  const { data: minimumDeposit } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "minimumDeposit",
  });

  const { data: memberInfo } = useScaffoldReadContract({
    contractName: "InvestmentPool",
    functionName: "getMemberInfo",
    args: [connectedAddress],
  });

  const { writeContractAsync: deposit, isPending: isDepositPending } = useScaffoldWriteContract("InvestmentPool");

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    try {
      await deposit({
        functionName: "deposit",
        value: parseEther(depositAmount),
      });
      setDepositAmount("");
    } catch (error) {
      console.error("Error al depositar:", error);
    }
  };

  const minDepositEth = minimumDeposit ? Number(formatEther(minimumDeposit)) : 0.01;
  const userBalance = memberInfo ? Number(formatEther(memberInfo[0])) : 0;
  const isActive = memberInfo ? memberInfo[2] : false;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">
          💰 Depositar Fondos
          <div className="badge badge-secondary">Paso 1</div>
        </h2>

        <div className="alert alert-info mb-4">
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
            <h3 className="font-bold">¿Cómo funciona?</h3>
            <div className="text-xs">
              Deposita ETH en el pool de inversión. Tu depósito te convierte en miembro activo y te permite participar
              en la creación de propuestas de inversión.
            </div>
          </div>
        </div>

        {/* Información del usuario si ya es miembro */}
        {isActive && (
          <div className="bg-success/10 rounded-lg p-4 mb-4 border border-success/20">
            <h3 className="font-bold text-success mb-2">✅ Ya eres miembro activo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tu balance actual</p>
                <p className="text-2xl font-bold text-success">{userBalance.toFixed(4)} ETH</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tu dirección</p>
                <Address address={connectedAddress} />
              </div>
            </div>
          </div>
        )}

        {/* Formulario de depósito */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Cantidad a depositar (ETH)</span>
            <span className="label-text-alt">Mínimo: {minDepositEth} ETH</span>
          </label>
          <div className="join">
            <input
              type="number"
              placeholder={`Mínimo ${minDepositEth} ETH`}
              className="input input-bordered join-item flex-1"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              step="0.01"
              min={minDepositEth}
            />
            <button
              className="btn btn-primary join-item"
              onClick={handleDeposit}
              disabled={isDepositPending || !depositAmount}
            >
              {isDepositPending ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Depositando...
                </>
              ) : (
                "Depositar"
              )}
            </button>
          </div>
          <label className="label">
            <span className="label-text-alt text-gray-500">
              {depositAmount && parseFloat(depositAmount) < minDepositEth && (
                <span className="text-error">⚠️ El monto debe ser al menos {minDepositEth} ETH</span>
              )}
            </span>
          </label>
        </div>

        {/* Botones rápidos */}
        <div className="mt-4">
          <p className="text-sm font-semibold mb-2">Montos rápidos:</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-sm btn-outline" onClick={() => setDepositAmount("0.01")}>
              0.01 ETH
            </button>
            <button className="btn btn-sm btn-outline" onClick={() => setDepositAmount("0.05")}>
              0.05 ETH
            </button>
            <button className="btn btn-sm btn-outline" onClick={() => setDepositAmount("0.1")}>
              0.1 ETH
            </button>
            <button className="btn btn-sm btn-outline" onClick={() => setDepositAmount("0.5")}>
              0.5 ETH
            </button>
            <button className="btn btn-sm btn-outline" onClick={() => setDepositAmount("1")}>
              1 ETH
            </button>
          </div>
        </div>

        {/* Beneficios de ser miembro */}
        <div className="mt-6 bg-base-200 rounded-lg p-4">
          <h3 className="font-bold mb-2">🎯 Beneficios de ser miembro:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Crear propuestas de inversión para el pool</li>
            <li>Participar en las decisiones de inversión del grupo</li>
            <li>Retirar tus fondos en cualquier momento</li>
            <li>Transparencia total sobre el uso de los fondos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
