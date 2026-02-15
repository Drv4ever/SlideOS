
export function fakeAIGenerate({ audience ,prompt,scenario, slides, textAmount, theme , tone }) {
    // Typo fixes and correct naming
    const slideTemplates = [
        "Introduction",
        "Key Concepts",
        "How it Works",
        "Examples",
        "Use Cases",
        "Advantages",
        "Limitations",
        "Conclusion",
    ];
    const contentLengthMap = {
        minimal: 1,
        concise: 2,
        detailed: 3,
        extensive: 4,
    };

    const pointsPerSlide = contentLengthMap[textAmount] || 2;

    const generatedSlides = Array.from({ length: slides }, (_, i) => {
        const title = slideTemplates[i] || `${prompt} - Part ${i + 1}`;
        return {
            slideNumber: i + 1,
            heading: title,
            content: Array.from({ length: pointsPerSlide }, (_, j) => {
                return `${title} point ${j + 1} related to ${prompt}`;
            }),
        };
    });

    return {
        title: prompt,
        theme,
        // meta was referencing undefined vars, removed for now
        slides: generatedSlides,
    };
}
