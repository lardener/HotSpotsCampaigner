-- Track which contract a detachment is working under for a specific month
CREATE TABLE IF NOT EXISTS detachment_contract_assignments (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    detachment_id VARCHAR(36) NOT NULL,
    contract_id VARCHAR(36) NOT NULL,
    `month_index` INT NOT NULL,
    CONSTRAINT fk_assign_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    UNIQUE KEY idx_det_month_contract (detachment_id, month_index)
);
