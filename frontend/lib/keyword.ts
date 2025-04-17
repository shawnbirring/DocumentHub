const stopwords = new Set([
    'the', 'and', 'is', 'in', 'to', 'of', 'a', 'for', 'on', 'with', 'as', 'by', 'an', 'this', 'that'
])

export function extractKeywords(text: string, limit = 20): { keyword: string, frequency: number }[] {
    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // remove punctuation
        .split(/\s+/)

    const counts: Record<string, number> = {}

    for (const word of words) {
        if (!stopwords.has(word) && word.length > 2) {
            counts[word] = (counts[word] || 0) + 1
        }
    }

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([keyword, frequency]) => ({ keyword, frequency }))
}
