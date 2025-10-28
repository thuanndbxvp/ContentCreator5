import React from 'react';

interface WordCountStats {
  sections: { title: string; count: number }[];
  total: number;
}

// Re-implement the word count logic to only count spoken words, similar to the "Tách voice" functionality.
const calculateWordCounts = (script: string): WordCountStats => {
    if (!script) return { sections: [], total: 0 };

    // Function to clean text to only include what would be spoken, removing headings, notes, speaker labels etc.
    const cleanForVoiceOver = (text: string): string => {
        return text
            // Remove speaker labels like "Minh Anh:", "Host (David):", etc.
            .replace(/^\s*[\w\d\s()]+:\s*/gm, '')
            // Remove content in square brackets like [intro music]
            .replace(/\[.*?\]/g, '')
            // Remove markdown bold/italic markers like **, *, _
            .replace(/(\*\*|\*|_)/g, '')
            // Remove horizontal rules
            .replace(/---/g, '');
    };
    
    // Function to count words in a cleaned string
    const countWords = (text: string): number => {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(Boolean).length;
    };

    // Split the script into sections based on markdown headings
    const sections = script.split(/(?=^(?:##|###)\s)/m).filter(s => s.trim());
    let total = 0;

    // Handle scripts that don't use markdown headings
    if (sections.length === 0 && script.trim().length > 0) {
        const cleanedScript = cleanForVoiceOver(script);
        const totalCount = countWords(cleanedScript);
        return { sections: [{ title: 'Toàn bộ kịch bản', count: totalCount }], total: totalCount };
    }
    
    if (sections.length === 0) {
        return { sections: [], total: 0 };
    }

    const sectionCounts = sections.map((section, index) => {
        const lines = section.split('\n').filter(Boolean);
        let title = `Phần ${index + 1}`;
        let content = section;

        // Extract title and content from the section
        if (lines.length > 0 && (lines[0].startsWith('##') || lines[0].startsWith('###'))) {
            title = lines[0].replace(/^[#\s]+/, '').trim();
            content = lines.slice(1).join('\n');
        } else if (index === 0) {
            // Handle case where the first section is an intro without a heading
             const hasOtherHeadings = sections.slice(1).some(s => s.trim().startsWith('##') || s.trim().startsWith('###'));
             if(hasOtherHeadings || sections.length === 1) title = "Mở đầu";
        }
        
        const cleanedContent = cleanForVoiceOver(content);
        const count = countWords(cleanedContent);
        total += count;
        return { title, count };
    });

    return { sections: sectionCounts, total };
};


export const WordCountCheck: React.FC<{ script: string; targetWordCount: string }> = ({ script, targetWordCount }) => {
    const stats = calculateWordCounts(script);
    const target = parseInt(targetWordCount, 10);
    
    let feedbackText = '';
    let feedbackColorClass = 'text-text-secondary';

    if (stats.total > 0 && !isNaN(target) && target > 0) {
        const difference = stats.total - target;
        const percentageDiff = (Math.abs(difference) / target) * 100;
        const sign = difference > 0 ? '+' : '';

        if (percentageDiff <= 10) { // within 10%
            feedbackColorClass = 'text-green-400';
            feedbackText = `✔ Đạt mục tiêu (${sign}${difference} từ, ~${percentageDiff.toFixed(0)}%)`;
        } else if (percentageDiff <= 20) { // between 10-20%
            feedbackColorClass = 'text-yellow-400';
            feedbackText = `⚠ Chênh lệch ${sign}${difference} từ (${percentageDiff.toFixed(0)}%)`;
        } else { // over 20%
            feedbackColorClass = 'text-red-400';
            feedbackText = `❌ Chênh lệch ${sign}${difference} từ (${percentageDiff.toFixed(0)}%)`;
        }
    }

    if (stats.total === 0) {
        return null;
    }

    return (
        <div className="bg-secondary rounded-lg p-6 shadow-xl space-y-3">
            <h3 className="text-md font-semibold text-text-primary mb-2">Kiểm tra Số từ (Lời thoại)</h3>
            <div>
                <table className="w-full text-sm text-left">
                    <tbody>
                        {stats.sections.map((sec, index) => (
                            <tr key={index} className="border-b border-primary/50 last:border-b-0">
                                <td className="py-1.5 pr-2 text-text-secondary truncate">{sec.title}</td>
                                <td className="py-1.5 text-right font-semibold text-text-primary whitespace-nowrap">{sec.count} từ</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="font-bold text-text-primary border-t border-primary pt-3 mt-3 flex justify-between items-baseline">
                <span>Tổng cộng:</span>
                <div className="text-right">
                    <span>{stats.total} từ</span>
                    {feedbackText && (
                        <p className={`font-normal text-xs ${feedbackColorClass}`}>{feedbackText}</p>
                    )}
                </div>
            </div>
        </div>
    );
};