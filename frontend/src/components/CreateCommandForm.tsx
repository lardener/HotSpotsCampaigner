import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

const ESTABLISH_COMMAND = gql`
  mutation EstablishCommand($name: String!, $commandingOfficer: String) {
    establishCommand(name: $name, commandingOfficer: $commandingOfficer) {
      id
      name
    }
  }
`;

interface EstablishCommandData {
    establishCommand: {
        id: string;
        name: string;
    };
}

interface CreateCommandFormProps {
    user?: { name: string };
    onCancel: () => void;
    onSuccess: (cmd: any) => void;
}

export const CreateCommandForm: React.FC<CreateCommandFormProps> = ({ user, onCancel, onSuccess }) => {
    const [name, setName] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('REGULAR');
    const [initialSP, setInitialSP] = useState(1000);
    const [error] = useState<string | null>(null);
    const [establishCommand, { loading }] = useMutation<EstablishCommandData>(ESTABLISH_COMMAND);

    const handleLevelChange = (level: string) => {
        setExperienceLevel(level);
        // Hinterlands/Chaos Campaign standard starting SP values
        switch (level) {
            case 'GREEN': setInitialSP(800); break;
            case 'REGULAR': setInitialSP(1000); break;
            case 'VETERAN': setInitialSP(1200); break;
            case 'ELITE': setInitialSP(1500); break;
            default: setInitialSP(1000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await establishCommand({
                variables: { name, commandingOfficer: user?.name }
            });
            if (data?.establishCommand) {
                onSuccess(data.establishCommand);
            }
        } catch (err) {
            alert("REGISTRY FAILURE: UNABLE TO ESTABLISH COMMAND.");
        }
    };

    return (
        <div className="container theme-red" style={{ maxWidth: '600px', margin: '40px auto' }}>
            <div className="tactical-panel" data-id="MRB-REC-SHEET">
                <h2 className="terminal-text">MERCENARY FORCE REGISTRATION</h2>
                <p className="restricted-text" style={{ fontSize: '0.8rem', marginBottom: '20px' }}>
                    MRB FORM 12-A: MERCENARY FORCE RECORD SHEET
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div className="form-group">
                            <label htmlFor="command-name" className="zone-header block-label">COMMAND NAME</label>
                            <input
                                id="command-name"
                                type="text"
                                className="mode-btn text-left"
                                style={{ width: '100%', padding: '10px' }}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="FORCE DESIGNATION..."
                                title="Enter the name of your mercenary unit"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="zone-header block-label">COMMANDING OFFICER</label>
                            <div className="mode-btn" style={{ padding: '10px', opacity: 0.7, cursor: 'default' }} title="CO assigned from neural link profile">
                                {user?.name || 'UNKNOWN COMMANDER'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                        <div className="form-group">
                            <label htmlFor="exp-level" className="zone-header block-label">EXPERIENCE LEVEL</label>
                            <select
                                id="exp-level"
                                className="mode-btn"
                                style={{ width: '100%', padding: '10px' }}
                                value={experienceLevel}
                                onChange={(e) => handleLevelChange(e.target.value)}
                                title="Select initial experience level"
                            >
                                <option value="GREEN">GREEN (800 SP)</option>
                                <option value="REGULAR">REGULAR (1000 SP)</option>
                                <option value="VETERAN">VETERAN (1200 SP)</option>
                                <option value="ELITE">ELITE (1500 SP)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="initial-sp" className="zone-header block-label">INITIAL WARCHEST (SP)</label>
                            <input
                                id="initial-sp"
                                type="number"
                                className="mode-btn text-left"
                                style={{ width: '100%', padding: '10px' }}
                                value={initialSP}
                                onChange={(e) => setInitialSP(parseInt(e.target.value))}
                                title="Initial Support Points"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="error-message tactical-panel" style={{ marginBottom: '15px', color: 'var(--terminal-alert)', borderColor: 'var(--terminal-alert)' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? 'REGISTERING...' : 'CONFIRM REGISTRATION'}
                        </button>
                        <button type="button" className="mode-btn" onClick={onCancel}>CANCEL</button>
                    </div>
                </form>
            </div>
        </div>
    );
};