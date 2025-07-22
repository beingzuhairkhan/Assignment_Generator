import { useState } from "react";
import { UploadCloud } from "lucide-react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';

const handwritingStyles = [
    { name: "Style 1", fontFamily: "Patrick Hand" },
    { name: "Style 2", fontFamily: "Dancing Script" },
    { name: "Style 3", fontFamily: "Indie Flower" },
    { name: "Style 4", fontFamily: "Kalam" },
];


const backgroundStyles = ["Blank", "Lined"];

const AssignmentForm = () => {
    const [selectedStyle, setSelectedStyle] = useState("Style 1");
    const [selectedBackground, setSelectedBackground] = useState("Blank");
    const [inkColor, setInkColor] = useState("Black");
    const [image, setImage] = useState(null);
    const [name, setName] = useState("");
    const [roll, setRoll] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setImage(file); // Store actual File object
        } else {
             toast.error("Only image files are allowed!");
        }
    };

 const handleSubmit = async () => {
    if (!name || !roll || !image) {
        toast.error("Please fill all required fields and upload an image.");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("roll", roll);
    formData.append("handwritingStyle", selectedStyle.name);
    formData.append("backgroundStyle", selectedBackground);
    formData.append("inkColor", inkColor);
    formData.append("file", image);

    try {
        setLoading(true);
        toast.loading("Generating assignment...", { id: "loadingToast" });

        const response = await axios.post("https://assignment-generator-rgmf.onrender.com/api/generate", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "handwritten-assignment.pdf");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success("Assignment downloaded successfully!", { id: "loadingToast" });
    } catch (error) {
        toast.error("Submission failed!", { id: "loadingToast" });
        console.error(error);
    } finally {
        setLoading(false);
    }
};


    return (
        <>
            {
                loading ? (
                    <div className="min-h-screen w-full flex items-center justify-center backdrop-blur-sm bg-black/60">
                        <div className="flex items-center justify-center text-yellow-400 space-x-2">
                            <svg
                                className="animate-spin h-6 w-6 text-yellow-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                            <span className="text-base font-medium text-white">Please wait, generating PDF...</span>
                        </div>
                    </div>
                ) : (
                    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-8">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">Create Handwritten Assignments</h1>
                        <p className="mb-6 text-gray-300 text-center text-sm md:text-base">
                            Upload your assignment questions and get AI-generated handwritten solutions
                        </p>

                        <div className="w-full max-w-3xl bg-black p-4 md:p-6 rounded-xl shadow-xl">
                            {/* Name & Roll */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-black text-white p-3 border border-gray-600 rounded-md w-full placeholder:text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Enter your roll number"
                                    value={roll}
                                    onChange={(e) => setRoll(e.target.value)}
                                    className="bg-black text-white p-3 border border-gray-600 rounded-md w-full placeholder:text-gray-400"
                                />
                            </div>

                            {/* Upload Image */}
                            <div className="border border-gray-600 p-6 text-center rounded-md mb-6 bg-black">
                                <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                                    <UploadCloud className="text-white" size={40} />
                                    <p className="font-medium text-white">Click to upload image</p>
                                    <small className="text-gray-400">(Supports only images)</small>
                                </label>
                                <input type="file" id="fileUpload" accept="image/*" className="hidden" onChange={handleUpload} />
                                {image && (
                                    <div className="mt-4">
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt="Preview"
                                            className="mx-auto max-h-48 rounded-md border border-white"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Handwriting Style */}
                            <p className="font-semibold mb-3">Select Handwriting Style</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                {handwritingStyles.map((style) => (
                                    <div
                                        key={style.name}
                                        onClick={() => setSelectedStyle(style)}
                                        className={`border p-4 rounded-md cursor-pointer text-center text-sm transition ${selectedStyle?.name === style.name
                                                ? "border-gray-600 bg-white text-black font-semibold"
                                                : "border-gray-600 bg-black text-white"
                                            }`}
                                    >
                                  
                                        <div style={{ fontFamily: style.fontFamily }}>
                                            The quick brown fox
                                        </div>
                                        <div className="mt-2 text-xs">{style.name}</div>
                                    </div>
                                ))}
                            </div>
                            {/* Upload custom font */}
                            <label
                                className={`flex flex-col items-center justify-center border p-4 rounded-md cursor-pointer text-center text-sm transition ${selectedStyle === "custom"
                                    ? "border-gray-600 bg-white text-black font-semibold"
                                    : "border-gray-600 bg-black text-white"
                                    }`}
                            >
                                <UploadCloud className={`mb-2 ${selectedStyle === "custom" ? "text-black" : "text-white"}`} size={30} />
                                <input
                                    type="file"
                                    //   accept=".ttf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setSelectedStyle("custom");
                                            alert(`Uploaded font: ${file.name}`);
                                        } else {
                                            alert("Please upload a valid .ttf file");
                                        }
                                    }}
                                />
                                Upload Font
                                <div className="mt-2 text-xs">(TTF Only)</div>
                            </label>


                            {/* Background Style */}
                            <p className="font-semibold mt-4 mb-3">Select Background Style</p>
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                {backgroundStyles.map((bg) => (
                                    <div
                                        key={bg}
                                        className={`relative flex-1 border p-6 text-center rounded-md cursor-pointer transition overflow-hidden ${selectedBackground === bg
                                            ? "border-2 border-gray-600 bg-white text-black font-semibold"
                                            : "border-gray-600 bg-black text-white"
                                            }`}
                                        onClick={() => setSelectedBackground(bg)}
                                    >
                                        {bg}
                                        {bg === "Lined" && (
                                            <>
                                                <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gray-600" />
                                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-600" />
                                                <div className="absolute top-3/4 left-0 w-full h-[1px] bg-gray-600" />
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Ink Color */}
                            <p className="font-semibold mb-3">Select Ink Color</p>
                            <div className="flex flex-wrap gap-6 items-center mb-6">
                                {["Black", "Blue"].map((color) => (
                                    <label key={color} className="flex items-center space-x-2 cursor-pointer text-sm">
                                        <input
                                            type="radio"
                                            name="inkColor"
                                            value={color}
                                            checked={inkColor === color}
                                            onChange={() => setInkColor(color)}
                                            className="form-radio text-white accent-white bg-black border-white focus:ring-white focus:ring-1"
                                        />
                                        <span className="capitalize">{color}</span>
                                    </label>
                                ))}
                            </div>

                           
                            <p className="text-sm italic text-gray-400 mb-4 text-center">
                                Tip: Verify answers – AI may sometimes make mistakes
                            </p>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`w-full py-3 rounded-md font-semibold transition ${loading
                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                    : "bg-white text-black hover:opacity-90"
                                    }`}
                            >
                                {loading ? "Generating..." : "Generate Handwritten Solution"}
                            </button>

                        </div>
                    </div>
                )
            }

        </>
    );
};

export default AssignmentForm;
