import React from 'react';

interface Props {
    units: any[];
    pilots: any[];
    compact?: boolean;
}

export const DetachmentReadinessSummary: React.FC<Props> = ({ units, pilots, compact = false }) => {
    const unitSummaries = Object.values(units.reduce((acc, u) => {
        const type = u.type || 'UNKNOWN';
        if (!acc[type]) acc[type] = { type, count: 0, tons: 0, bv: 0, pv: 0, sz: 0 };
        acc[type].count++;
        acc[type].tons += u.tonnage || 0;
        acc[type].bv += u.bv || 0;
        acc[type].pv += u.pv || 0;
        acc[type].sz += u.asSize || 0;
        return acc;
    }, {} as Record<string, any>));

    const pilotSummaries = Object.values(pilots.reduce((acc, p) => {
        const spec = p.unitType || 'UNKNOWN';
        if (!acc[spec]) acc[spec] = { spec, count: 0, gun: 0, pil: 0, as: 0 };
        acc[spec].count++;
        acc[spec].gun += p.gunnery || 0;
        acc[spec].pil += p.piloting || 0;
        acc[spec].as += p.asSkill || 0;
        return acc;
    }, {} as Record<string, any>));

    return (
        <div className="flex flex-gap-20" style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: '15px' }}>
            <div>
                <span className="restricted-text" style={{ fontSize: '0.6rem' }}>UNIT READINESS</span>
                <table className="tactical-table sm-text" style={{ marginTop: '5px', fontSize: '0.7rem' }}>
                    <thead>
                        <tr>
                            <th className="text-center">TYPE</th>
                            <th className="text-center">QTY</th>
                            <th className="text-center">TONS</th>
                            <th className="text-center">BV</th>
                            <th className="text-center">PV</th>
                        </tr>
                    </thead>
                    <tbody>
                        {unitSummaries.map((s: any) => (
                            <tr key={s.type}>
                                <td className="text-center">{s.type}</td>
                                <td className="text-center">{s.count}</td>
                                <td className="text-right">{s.tons}</td>
                                <td className="text-right">{s.bv}</td>
                                <td className="text-right">{s.pv}</td>
                            </tr>
                        ))}
                        <tr style={{ borderTop: '1px dashed var(--accent-dim)', fontWeight: 'bold' }}>
                            <td className="text-center">TTL</td>
                            <td className="text-center">{unitSummaries.reduce((sum: number, s: any) => sum + s.count, 0)}</td>
                            <td className="text-right">{unitSummaries.reduce((sum: number, s: any) => sum + s.tons, 0)}</td>
                            <td className="text-right">{unitSummaries.reduce((sum: number, s: any) => sum + s.bv, 0)}</td>
                            <td className="text-right">{unitSummaries.reduce((sum: number, s: any) => sum + s.pv, 0)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                <span className="restricted-text" style={{ fontSize: '0.6rem' }}>PILOT READINESS</span>
                <table className="tactical-table sm-text" style={{ marginTop: '5px', fontSize: '0.7rem' }}>
                    <thead>
                        <tr>
                            <th className="text-center">SPEC</th>
                            <th className="text-center">QTY</th>
                            <th className="text-center">AVG G/P</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pilotSummaries.map((s: any) => (
                            <tr key={s.spec}>
                                <td className="text-center">{s.spec}</td>
                                <td className="text-center">{s.count}</td>
                                <td className="text-center">{(s.gun / s.count).toFixed(1)} / {(s.pil / s.count).toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};