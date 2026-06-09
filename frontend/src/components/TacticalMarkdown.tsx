import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TacticalMarkdownProps {
    content: string;
    onAction: (url: string) => void;
}

export const TacticalMarkdown: React.FC<TacticalMarkdownProps> = ({ content, onAction }) => {
    return (
        <Markdown
            remarkPlugins={[remarkGfm]}
            urlTransform={(url) => url.startsWith('hsc://') ? url : url}
            components={{
                a: ({ node, href, children, ...props }: any) => {
                    // Handle custom HSC action protocol by intercepting the click
                    if (href?.startsWith('hsc://')) {
                        return (
                            <a
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onAction(href);
                                }} className="hsc-action-link" style={{ color: 'var(--terminal-blue)', textDecoration: 'underline', cursor: 'pointer' }}>
                                {children}
                            </a>
                        );
                    }
                    // Default behavior for external links, ensuring they don't trigger parent edit modes
                    return <a href={href} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                }
            }}
        >
            {content}
        </Markdown>
    );
};