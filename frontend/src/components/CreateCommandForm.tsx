import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

const ESTABLISH_COMMAND = gql`
  mutation EstablishCommand($name: String!, $commandingOfficer: String, $totalSupportPoints: Int) {
    establishCommand(name: $name, commandingOfficer: $commandingOfficer, totalSupportPoints: $totalSupportPoints) {
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
    user: { name: string; id: string; displayName?: string | null } | null;
    onCancel: () => void;
    onSuccess: (cmd: any) => void;
}

export const CreateCommandForm: React.FC<CreateCommandFormProps> = ({ user, onCancel, onSuccess }) => {
    const [name, setName] = useState('');
    const [commandingOfficer, setCommandingOfficer] = useState(user?.displayName || user?.name || '');
    const [scale, setScale] = useState(1);
    const [initialSP, setInitialSP] = useState(3000);
    const [error] = useState<string | null>(null);
    const [establishCommand, { loading }] = useMutation<EstablishCommandData>(ESTABLISH_COMMAND);

    const handleScaleChange = (val: number) => {
        setScale(val);
        setInitialSP(3000 * val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await establishCommand({
                variables: { name, commandingOfficer, totalSupportPoints: initialSP }
            });
            if (data?.establishCommand) {
                onSuccess(data.establishCommand);
            }
        } catch (err) {
            alert("REGISTRY FAILURE: UNABLE TO ESTABLISH COMMAND.");
        }
    };

    return (
        <div className="container theme-red max-w-600 mx-auto my-40">
            <div className="tactical-panel" data-id="MRB-REC-SHEET">
                <h2 className="terminal-text">MERCENARY FORCE REGISTRATION</h2>
                <p className="restricted-text sm-text mb-20">
                    MRB FORM 12-A: MERCENARY FORCE RECORD SHEET
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="grid-2-col mb-15">
                        <div className="form-group">
                            <label htmlFor="command-name" className="zone-header block-label">COMMAND NAME</label>
                            <input
                                id="command-name"
                                type="text"
                                className="mode-btn text-left w-100 p-10"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="FORCE DESIGNATION..."
                                title="Enter the name of your mercenary unit"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="command-co" className="zone-header block-label">COMMANDING OFFICER</label>
                            <input
                                id="command-co"
                                type="text"
                                className="mode-btn text-left w-100 p-10"
                                value={commandingOfficer}
                                onChange={(e) => setCommandingOfficer(e.target.value)}
                                placeholder="COMMANDER NAME..."
                                title="Enter the name of the commanding officer"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid-2-col mb-25">
                        <div className="form-group">
                            <label htmlFor="force-scale" className="zone-header block-label">FORCE SCALE</label>
                            <select
                                id="force-scale"
                                className="mode-btn w-100 p-10"
                                value={scale}
                                onChange={(e) => handleScaleChange(parseInt(e.target.value))}
                                title="Select the scale of the mercenary force"
                            >
                                <option value={1}>SCALE 1 (3000 SP)</option>
                                <option value={2}>SCALE 2 (6000 SP)</option>
                                <option value={3}>SCALE 3 (9000 SP)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="initial-sp" className="zone-header block-label">INITIAL WARCHEST (SP)</label>
                            <input
                                id="initial-sp"
                                type="number"
                                className="mode-btn text-left w-100 p-10"
                                value={initialSP}
                                onChange={(e) => setInitialSP(parseInt(e.target.value))}
                                title="Initial Support Points"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="error-message tactical-panel mb-15 alert-border">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-gap-10">
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