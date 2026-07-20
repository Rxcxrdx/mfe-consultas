import React, { useEffect, useState } from 'react';

type TipoCuenta = 'obligatoria' | 'voluntaria' | 'cesantias';

interface Saldo {
  cuentaId: string;
  obligatoria: number;
  voluntaria: number;
  cesantias: number;
  moneda: string;
  actualizadoEn: string;
}

interface Props {
  cuentaId?: string;
}

const API_URL = process.env.API_URL || 'http://localhost:3001';

function formatoMoneda(valor: number, moneda: string): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: moneda }).format(valor);
}

export default function ConsultaSaldo({ cuentaId = '1001' }: Props) {
  const [tipo, setTipo] = useState<TipoCuenta>('obligatoria');
  const [saldo, setSaldo] = useState<Saldo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    fetch(`${API_URL}/api/saldos/${cuentaId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }
        return res.json();
      })
      .then((data: Saldo) => {
        if (!cancelado) setSaldo(data);
      })
      .catch((err: Error) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [cuentaId]);

  return (
    <div
      data-testid="consulta-saldo"
      style={{
        fontFamily: 'sans-serif',
        maxWidth: 420,
        margin: '1rem auto',
        padding: '1.5rem',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        backgroundColor: '#fff',
      }}
    >
      <h2 style={{ margin: '0 0 1rem', color: '#1a202c' }}>Consulta de saldo</h2>

      <label htmlFor="tipo-cuenta" style={{ display: 'block', marginBottom: 4, color: '#4a5568', fontSize: '0.9rem' }}>
        Tipo de cuenta
      </label>
      <select
        id="tipo-cuenta"
        value={tipo}
        onChange={(e) => setTipo(e.target.value as TipoCuenta)}
        style={{
          width: '100%',
          padding: '0.5rem',
          borderRadius: 6,
          border: '1px solid #cbd5e0',
          fontSize: '1rem',
          marginBottom: '1rem',
        }}
      >
        <option value="obligatoria">Obligatoria</option>
        <option value="voluntaria">Voluntaria</option>
        <option value="cesantias">Cesantías</option>
      </select>

      {cargando && <p style={{ color: '#718096' }}>Cargando saldo...</p>}
      {error && (
        <p role="alert" style={{ color: '#c53030', backgroundColor: '#fff5f5', padding: '0.5rem', borderRadius: 6 }}>
          No se pudo cargar el saldo: {error}
        </p>
      )}
      {saldo && !cargando && !error && (
        <p
          data-testid="saldo-valor"
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#2f855a',
            margin: 0,
          }}
        >
          {formatoMoneda(saldo[tipo], saldo.moneda)}
          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 400, color: '#718096' }}>
            Saldo {tipo}
          </span>
        </p>
      )}
    </div>
  );
}
