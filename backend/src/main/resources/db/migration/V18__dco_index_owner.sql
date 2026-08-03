-- Index for detachment_contract_overrides by owner
CREATE INDEX idx_detachment_contract_overrides_owner 
    ON detachment_contract_overrides (owner_user_id);
