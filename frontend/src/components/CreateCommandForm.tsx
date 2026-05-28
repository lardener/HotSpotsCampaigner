import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { TerminalOverlay } from './TerminalOverlay';
import { CommandUpdateInput } from '../types/global'; // Import the shared interface

// GraphQL mutation for establishing a command
const ESTABLISH_COMMAND = gql`
  mutation EstablishCommand($input: CommandUpdateInput!) {
    establishCommand(input: $input) {
      id
      name
      commandingOfficer
      totalSupportPoints
      reputation
    }
  }
`;

// Expected data structure from the mutation response
interface EstablishCommandData {
    establishCommand: {
        id: string;
        name: string;
        commandingOfficer?: string;
        totalSupportPoints: number;
        reputation: number;
    };
}

// Props for the CreateCommandForm component
interface CreateCommandFormProps {
    user: { name: string; displayName?: string | null };
    onCancel: () => void;
    onSuccess: (newCommand: EstablishCommandData['establishCommand']) => void;
}

export const CreateCommandForm: React.FC<CreateCommandFormProps> = ({ user, onCancel, onSuccess }) => {
    const [commandName, setCommandName] = useState('');
    const [commandingOfficer, setCommandingOfficer] = useState(user.displayName || user.name || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [establishCommand] = useMutation<EstablishCommandData, { input: CommandUpdateInput }>(ESTABLISH_COMMAND);

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setError(null);
        if (!commandName.trim()) {
            setError("COMMAND NAME REQUIRED.");
            return;
        }

        setIsSubmitting(true);
        try {
            const input: CommandUpdateInput = {
                name: commandName,
                commandingOfficer: commandingOfficer || user.displayName || user.name, // Fallback to user's name if CO is empty
                totalSupportPoints: 3000, // Default value from RulesConstants
                reputation: 1 // Default value from RulesConstants
            };

            const { data } = await establishCommand({ variables: { input } });
            if (data?.establishCommand) {
                onSuccess(data.establishCommand);
            } else {
                setError("FAILED TO ESTABLISH COMMAND: NO DATA RETURNED.");
            }
        } catch (err: any) {
            console.error("Error establishing command:", err);
            setError(`FAILURE: ${err.message || 'UNKNOWN ERROR'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <TerminalOverlay
            title="ESTABLISH NEW MERCENARY COMMAND"
            message="REGISTER YOUR UNIT WITH THE MERCENARY REVIEW AND BONDING COMMISSION."
            confirmLabel={isSubmitting ? "ESTABLISHING..." : "ESTABLISH"}
            onConfirm={handleSubmit}
            onCancel={onCancel}
            themeClass="theme-amber"
        > {/* Removed onSubmit from form as TerminalOverlay's onConfirm handles the action */}
            <form className="flex-col flex-gap-15 mt-20" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div className="input-group">
                    <label htmlFor="command-name" className="restricted-text">COMMAND DESIGNATION:</label>
                    <input
                        id="command-name"
                        type="text"
                        className="table-input w-100"
                        value={commandName}
                        onChange={(e) => setCommandName(e.target.value.toUpperCase())}
                        placeholder="ENTER COMMAND NAME"
                        maxLength={255}
                        disabled={isSubmitting}
                        autoFocus
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="commanding-officer" className="restricted-text">COMMANDING OFFICER:</label>
                    <input
                        id="commanding-officer"
                        type="text"
                        className="table-input w-100"
                        value={commandingOfficer}
                        onChange={(e) => setCommandingOfficer(e.target.value)}
                        placeholder="YOUR CALLSIGN"
                        disabled={isSubmitting}
                        maxLength={255}
                    />
                </div>
                {error && <div className="error-message text-center">{error}</div>}
            </form>
        </TerminalOverlay>
    );
};