async function run() {
    try {
        console.log("Testing POST /api/incidents...");
        const res = await fetch("http://127.0.0.1:5000/api/incidents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Payment API returning 500 errors after deployment",
                description: "Users are unable to complete payments. The payment API started returning HTTP 500 errors after the latest deployment."
            })
        });
        const data = await res.json();
        console.log("Incident Created:", data.id, "Category:", data.categoryId);

        console.log("Testing search indirectly...");
        
        console.log("Testing POST /api/incidents/:id/analyze...");
        const res2 = await fetch(`http://127.0.0.1:5000/api/incidents/${data.id}/analyze`, { method: "POST" });
        const data2 = await res2.json();
        console.log("Analysis Success:", !!data2.analysis);
        if (data2.analysis) {
             console.log("AI Summary:", data2.analysis.summary);
        } else {
             console.log("Error from analysis:", data2);
        }
    } catch(e) {
        console.error("Test failed:", e);
    }
}
run();
