import React, { useState, useEffect } from 'react';
import './navigation-tree.css';

export type NodeType = 'ROOT' | 'DEPLOYMENT' | 'COMMAND' | 'DETACHMENT' | 'CAMPAIGN' | 'INTEL';

export interface TreeItem {
    id: string;
    label: string;
    type: NodeType;
    children?: TreeItem[];
    initiallyExpanded?: boolean;
    metadata?: Record<string, any>;
}

const getNodeIcon = (type: NodeType) => {
    switch (type) {
        case 'DEPLOYMENT':
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
            );
        case 'COMMAND':
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            );
        case 'DETACHMENT':
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="7 7 12 12 7 17" />
                    <polyline points="13 7 18 12 13 17" />
                </svg>
            );
        case 'CAMPAIGN':
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
            );
        case 'INTEL':
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );
        default:
            return <span className="node-dot" />;
    }
};

interface TreeNodeProps {
    item: TreeItem;
    level: number;
    onSelect: (item: TreeItem) => void;
    selectedId?: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({ item, level, onSelect, selectedId }) => {
    const [isOpen, setIsOpen] = useState(item.initiallyExpanded ?? false);
    const hasChildren = item.children && item.children.length > 0;
    const isSelected = selectedId === item.id;
    const isRoot = item.type === 'ROOT';

    useEffect(() => {
        setIsOpen(item.initiallyExpanded ?? false);
    }, [item.initiallyExpanded]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className="tree-node-wrapper">
            <div
                className={`tree-node ${isSelected ? 'selected' : ''} ${isRoot ? 'root-node' : ''}`}
                onClick={() => onSelect(item)}
                title={item.label}
            >
                {hasChildren ? (
                    <span className={`toggle-arrow ${isOpen ? 'open' : ''}`} onClick={handleToggle}>
                        ▶
                    </span>
                ) : (
                    <span className="toggle-spacer" />
                )}
                {!isRoot && (
                    <span className="node-icon">
                        {getNodeIcon(item.type)}
                    </span>
                )}
                <span className={`label type-${item.type.toLowerCase()}`}>
                    {item.label}
                </span>
            </div>
            {hasChildren && isOpen && (
                <div className="children-container">
                    {item.children!.map((child) => (
                        <TreeNode
                            key={child.id}
                            item={child}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedId={selectedId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const NavigationTree: React.FC<{
    data: TreeItem[];
    onSelect: (item: TreeItem) => void;
    selectedId?: string;
}> = ({ data, onSelect, selectedId }) => {
    return (
        <div style={{ padding: '0 10px' }}>
            {data.map((item) => (
                <TreeNode
                    key={item.id}
                    item={item}
                    level={0}
                    onSelect={onSelect}
                    selectedId={selectedId}
                />
            ))}
        </div>
    );
};