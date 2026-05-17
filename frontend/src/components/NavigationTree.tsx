import React, { useState } from 'react';
import '../styles/navigation-tree.css';

export type NodeType = 'ROOT' | 'DEPLOYMENT' | 'COMMAND' | 'DETACHMENT' | 'CAMPAIGN' | 'INTEL';

export interface TreeItem {
    id: string;
    label: string;
    type: NodeType;
    children?: TreeItem[];
    metadata?: Record<string, any>;
}

interface TreeNodeProps {
    item: TreeItem;
    level: number;
    onSelect: (item: TreeItem) => void;
    selectedId?: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({ item, level, onSelect, selectedId }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = item.children && item.children.length > 0;
    const isSelected = selectedId === item.id;
    const isRoot = item.type === 'ROOT';

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className="tree-node-wrapper">
            <div
                className={`tree-node ${isSelected ? 'selected' : ''} ${isRoot ? 'root-node' : ''}`}
                onClick={() => onSelect(item)}
            >
                {hasChildren ? (
                    <span className={`toggle-arrow ${isOpen ? 'open' : ''}`} onClick={handleToggle}>
                        ▶
                    </span>
                ) : !isRoot && (
                    <span className="node-dot" />
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
        <aside className="sidebar-nav">
            <div className="nav-header">COMMAND & CONTROL</div>
            <div className="tree-scroll-area">
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
        </aside>
    );
};