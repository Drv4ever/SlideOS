
export function fakeAIGenerate({ audience ,prompt,scenario, slides, textAmount, theme , tone }) {
    // Typo fixes and correct naming
    const slideTemplates = [
        "Introduction and Executive Summary",
        "Historical Context and Evolution",
        "Technical Fundamentals and Core Architecture",
        "Practical Methodologies and Workflows",
        "Key Challenges, Risks and Mitigations",
        "Strategic Advantages and Core Benefits",
        "Future Outlook, Trends and Scale",
        "Summary, Takeaways and Next Steps",
    ];

    const pointsPerSlideMap = {
        minimal: 2,
        concise: 3,
        detailed: 4,
        extensive: 5,
    };
    const pointsPerSlide = pointsPerSlideMap[textAmount] || 3;

    const detailedPhrases = [
        `Analyzing the foundational building blocks of ${prompt} to establish a framework for scale and long-term viability.`,
        `Addressing standard industry pain points by comparing existing approaches against new models built around ${prompt}.`,
        `Reviewing critical case studies, implementation templates, and standard workflows used by early adopters.`,
        `Identifying common anti-patterns, potential roadblocks, and strategic mitigations when scaling ${prompt}.`,
        `Measuring performance metrics, operational efficiency, and ROI indicators across diverse scenarios.`,
        `Leveraging best practices and technical specifications to configure environments for optimal speed and security.`,
    ];

    const generatedSlides = Array.from({ length: slides }, (_, i) => {
        const title = slideTemplates[i] || `${prompt} Analysis - Part ${i + 1}`;
        return {
            slideNumber: i + 1,
            heading: title,
            content: Array.from({ length: pointsPerSlide }, (_, j) => {
                const phraseIndex = (i + j) % detailedPhrases.length;
                return detailedPhrases[phraseIndex];
            }),
        };
    });

    return {
        title: prompt,
        theme,
        slides: generatedSlides,
    };
}
