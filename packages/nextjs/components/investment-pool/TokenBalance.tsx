"use client";

import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

export const TokenBalance = () => {
  const { address: connectedAddress } = useAccount();

  // Leer balance de tokens PIT
  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "PoolInvestmentToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Leer suministro total
  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "PoolInvestmentToken",
    functionName: "totalSupply",
  });

  // Calcular porcentaje del pool
  const percentageOfPool = tokenBalance && totalSupply && totalSupply > 0n
    ? (Number(tokenBalance) / Number(totalSupply) * 100).toFixed(2)
    : "0";

  // Leer nombre y símbolo del token
  const { data: tokenName } = useScaffoldReadContract({
    contractName: "PoolInvestmentToken",
    functionName: "name",
  });

  const { data: tokenSymbol } = useScaffoldReadContract({
    contractName: "PoolInvestmentToken",
    functionName: "symbol",
  });

  if (!connectedAddress) {
    return null;
  }

  return (
    <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl">
          💎 Tus Tokens de Gobernanza
        </h2>
        
        <div className="stats stats-vertical lg:stats-horizontal shadow mt-4 bg-base-100 text-base-content">
          <div className="stat">
            <div className="stat-title">Balance de Tokens</div>
            <div className="stat-value text-primary">
              {tokenBalance ? formatEther(tokenBalance) : "0"}
            </div>
            <div className="stat-desc">{tokenSymbol || "PIT"} Tokens</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Poder de Voto</div>
            <div className="stat-value text-secondary">
              {percentageOfPool}%
            </div>
            <div className="stat-desc">Del total del pool</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Suministro Total</div>
            <div className="stat-value text-accent text-2xl">
              {totalSupply ? formatEther(totalSupply) : "0"}
            </div>
            <div className="stat-desc">Tokens en circulación</div>
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
            <h3 className="font-bold">¿Qué son los tokens {tokenSymbol || "PIT"}?</h3>
            <div className="text-xs mt-1">
              <p>• Recibes tokens automáticamente al depositar (1 ETH = 1000 {tokenSymbol || "PIT"})</p>
              <p>• Tus tokens representan tu poder de voto en propuestas</p>
              <p>• Se queman automáticamente cuando retiras fondos</p>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-base-100 text-base-content rounded-lg p-4">
            <h4 className="font-bold mb-2">📊 Ratio de Conversión</h4>
            <p className="text-sm">1 ETH = 1,000 {tokenSymbol || "PIT"}</p>
            <p className="text-xs text-gray-500 mt-1">
              Tus tokens se ajustan automáticamente con tus depósitos y retiros
            </p>
          </div>

          <div className="bg-base-100 text-base-content rounded-lg p-4">
            <h4 className="font-bold mb-2">🗳️ Uso de Tokens</h4>
            <p className="text-sm">Vota en propuestas de inversión</p>
            <p className="text-xs text-gray-500 mt-1">
              Más tokens = mayor peso en las decisiones del pool
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
