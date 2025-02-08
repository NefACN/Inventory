import jsPDF from "jspdf";

const exportToPDF = async (elementId: string, fileName: string) => {
    const pdf = new jsPDF({
        orientation: "landscape", // Consider landscape for wider tables
        unit: "pt",
        format: "a4",
    });

    const element = document.getElementById(elementId);
    if (!element) {
        console.error("Elemento no encontrado.");
        return;
    }

    try {
        await pdf.html(element, {
            callback: function(doc) {
                doc.save(`${fileName}.pdf`);
            },
            x: 10,
            y: 10,
            width: 800, // Increased width for landscape
            windowWidth: element.scrollWidth,
            autoPaging: 'text'
        });
    } catch (error) {
        console.error("PDF Export Error:", error);
    }
};
export default exportToPDF;
