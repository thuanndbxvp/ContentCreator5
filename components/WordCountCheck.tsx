import React from 'react';

interface WordCountStats {
  sections: { title: string; count: number }[];
  total: number;
}

const calculateWordCounts = (script: string): WordCountStats => {
    if (!script) return { sections: [], total: 0 };

    // Corrected regex to split on headings (## or ###) only at the start of a line.
    const sections = script.split(/(?=^(?:##|###)\s)/m).filter(s => s.trim());
    let total = 0;
    
    if (sections.length === 0 && script.trim().length > 0) {
        const totalCount = script.split(/\s+/).filter(Boolean).length;
        return { sections: [{ title: 'Toàn bộ kịch bản', count: totalCount }], total: totalCount };
    }
    
    if (sections.length === 0) {
        return { sections: [], total: 0 };
    }

    const sectionCounts = sections.map((section, index) => {
        const lines = section.split('\n').filter(Boolean);
        let title = `Phần ${index + 1}`;
        let content;

        if (lines.length > 0 && (lines[0].startsWith('##') || lines[0].startsWith('###'))) {
            title = lines[0].replace(/^[#\s]+/, '').trim();
            content = lines.slice(1).join(' ');
        } else {
            content = lines.join(' ');
            if (index === 0) {
                 const hasOtherHeadings = sections.slice(1).some(s => s.trim().startsWith('##') || s.trim().startsWith('###'));
                 if(hasOtherHeadings || sections.length === 1) title = "Mở đầu";
            }
        }
        
        const count = content.split(/\s+/).filter(Boolean).length;
        total += count;
        return { title, count };
    });

    return { sections: sectionCounts, total };
};


export const WordCountCheck: React.FC<{ script: string; targetWordCount: string }> = ({ script, targetWordCount }) => {
    const stats = calculateWordCounts(script);
    const target = parseInt(targetWordCount, 10);
    const difference = Math.abs(stats.total - target);
    
    let matchText = '';
    if (stats.total > 0 && !isNaN(target)) {
        if (difference === 0) {
            matchText = '(Perfectly matches the target)';
        } else if (difference <= target * 0.1) { // within 10%
            matchText = '(Closely matches the target)';
        } else {
            const sign = stats.total > target ? '+' : '-';
            matchText = `(${sign}${difference} words from target)`;
        }
    }

    if (stats.total === 0) {
        return null;
    }

    return (
        <div className="bg-secondary rounded-lg p-6 shadow-xl space-y-2">
            <h3 className="text-md font-semibold text-text-primary mb-2">Word Count Check:</h3>
            <ul className="text-text-secondary space-y-1">
                {stats.sections.map((sec, index) => (
                    <li key={index}>* <span className="font-semibold text-text-primary">{sec.title}:</span> {sec.count} words</li>
                ))}
            </ul>
            <p className="font-bold text-text-primary border-t border-primary pt-3 mt-3">
                * Tổng cộng: {stats.total} words. <span className="text-green-400 font-normal text-sm">{matchText}</span>
            </p>
        </div>
    );
};