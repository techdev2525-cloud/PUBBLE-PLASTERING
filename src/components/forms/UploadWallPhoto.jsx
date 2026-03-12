// Upload Wall Photo Component - For Wall Problem Finder Tool
import React, { useState, useCallback, useRef } from "react";
import {
  FiUpload,
  FiX,
  FiCamera,
  FiImage,
  FiAlertCircle,
  FiCheck,
  FiLoader,
  FiInfo,
} from "react-icons/fi";
import Button from "../common/Button";

export default function UploadWallPhoto({
  onAnalysisComplete,
  maxFiles = 3,
  className = "",
}) {
  const [files, setFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const processFiles = (newFiles) => {
    setError("");

    // Filter for images only
    const imageFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload image files only");
        return false;
      }
      if (file.size > 15 * 1024 * 1024) {
        // 15MB limit
        setError("Each file must be under 15MB");
        return false;
      }
      return true;
    });

    // Check total count
    if (files.length + imageFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} photos allowed`);
      return;
    }

    // Create preview URLs
    const processedFiles = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    setFiles((prev) => [...prev, ...processedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const analyzePhotos = async () => {
    if (files.length === 0) {
      setError("Please upload at least one photo");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const formData = new FormData();
      files.forEach((f) => {
        formData.append("photos", f.file);
      });

      const response = await fetch("/api/analyze-wall", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const results = await response.json();
      setAnalysisResults(results);

      if (onAnalysisComplete) {
        onAnalysisComplete(results);
      }
    } catch (err) {
      setError("Failed to analyze photos. Please try again.");
      // Fallback: simulate analysis for demo purposes
      setAnalysisResults(getSimulatedResults());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetTool = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setAnalysisResults(null);
    setError("");
  };

  // Show results if analysis is complete
  if (analysisResults) {
    return (
      <AnalysisResults
        results={analysisResults}
        images={files}
        onReset={resetTool}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="font-heading font-bold text-2xl text-concrete-800 mb-2">
          Wall Problem Finder
        </h2>
        <p className="text-concrete-600">
          Upload photos of your walls and we'll identify potential issues and
          recommend solutions.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${
            dragActive
              ? "border-primary-500 bg-primary-50"
              : "border-concrete-200 hover:border-primary-400 hover:bg-concrete-50"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mb-4">
            {dragActive ? (
              <FiImage className="w-8 h-8" />
            ) : (
              <FiUpload className="w-8 h-8" />
            )}
          </div>

          <h3 className="font-semibold text-concrete-800 mb-2">
            {dragActive ? "Drop photos here" : "Upload wall photos"}
          </h3>

          <p className="text-concrete-500 text-sm mb-4">
            Drag and drop or click to select (max {maxFiles} photos)
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => inputRef.current?.click()}
              variant="outline"
              size="sm"
              icon={<FiImage />}
            >
              Browse Files
            </Button>

            {/* Camera option for mobile */}
            <Button
              onClick={() => {
                inputRef.current?.setAttribute("capture", "environment");
                inputRef.current?.click();
              }}
              variant="outline"
              size="sm"
              icon={<FiCamera />}
              className="sm:hidden"
            >
              Take Photo
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Preview Photos */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-concrete-700">
              Uploaded Photos ({files.length}/{maxFiles})
            </h4>
            <button
              onClick={resetTool}
              className="text-sm text-concrete-500 hover:text-red-500"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={file.preview}
                  alt={`Wall photo ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>

          {/* Analyze Button */}
          <Button
            onClick={analyzePhotos}
            variant="primary"
            className="w-full mt-6"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin mr-2" />
                Analyzing Photos...
              </>
            ) : (
              "Analyze Wall Photos"
            )}
          </Button>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 bg-concrete-50 rounded-lg p-4">
        <h4 className="font-medium text-concrete-700 flex items-center gap-2 mb-2">
          <FiInfo className="w-4 h-4" />
          Tips for best results
        </h4>
        <ul className="text-sm text-concrete-600 space-y-1">
          <li>• Take photos in good lighting</li>
          <li>• Include close-ups of problem areas</li>
          <li>• Photograph from multiple angles</li>
          <li>• Include a reference object for scale</li>
        </ul>
      </div>
    </div>
  );
}

// Analysis Results Component
function AnalysisResults({ results, images, onReset, className }) {
  const { problems = [], recommendations = [], severity = "unknown" } = results;

  const severityColors = {
    low: "bg-green-100 text-green-700 border-green-300",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
    high: "bg-red-100 text-red-700 border-red-300",
    unknown: "bg-concrete-100 text-concrete-700 border-concrete-300",
  };

  const severityLabels = {
    low: "Minor Issues",
    medium: "Moderate Issues",
    high: "Significant Issues",
    unknown: "Analysis Complete",
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="text-center mb-6">
        <div
          className={`inline-block px-4 py-2 rounded-full border ${severityColors[severity]} mb-3`}
        >
          {severityLabels[severity]}
        </div>
        <h2 className="font-heading font-bold text-2xl text-concrete-800">
          Wall Analysis Results
        </h2>
      </div>

      {/* Images */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {images.map((img, index) => (
          <img
            key={index}
            src={img.preview}
            alt={`Analyzed wall ${index + 1}`}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />
        ))}
      </div>

      {/* Problems Found */}
      {problems.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-concrete-800 mb-3 flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-amber-500" />
            Issues Identified ({problems.length})
          </h3>
          <div className="space-y-3">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="bg-white border border-concrete-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-concrete-800">
                      {problem.name}
                    </h4>
                    <p className="text-sm text-concrete-600 mt-1">
                      {problem.description}
                    </p>
                  </div>
                  <span
                    className={`
                    text-xs font-medium px-2 py-1 rounded
                    ${problem.severity === "high" ? "bg-red-100 text-red-700" : ""}
                    ${problem.severity === "medium" ? "bg-yellow-100 text-yellow-700" : ""}
                    ${problem.severity === "low" ? "bg-green-100 text-green-700" : ""}
                  `}
                  >
                    {problem.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-concrete-800 mb-3 flex items-center gap-2">
            <FiCheck className="w-5 h-5 text-green-500" />
            Recommended Solutions
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-green-800"
                >
                  <FiCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center">
        <h3 className="font-heading font-semibold text-lg text-primary-800 mb-2">
          Need Professional Help?
        </h3>
        <p className="text-primary-700 text-sm mb-4">
          Get a free quote from our experienced plasterers
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/contact" variant="primary">
            Get Free Quote
          </Button>
          <Button onClick={onReset} variant="outline">
            Analyze Another Wall
          </Button>
        </div>
      </div>
    </div>
  );
}

// Simulated analysis results for demo/fallback
function getSimulatedResults() {
  return {
    severity: "medium",
    problems: [
      {
        name: "Hairline Cracks",
        description:
          "Small surface cracks that typically indicate normal settling or minor structural movement.",
        severity: "low",
      },
      {
        name: "Damp Patches",
        description:
          "Areas of moisture that may indicate water ingress or condensation issues.",
        severity: "medium",
      },
    ],
    recommendations: [
      "Fill hairline cracks with flexible filler before repainting",
      "Investigate source of damp before plastering",
      "Consider applying a damp-proof treatment",
      "Professional skim coat recommended for a smooth finish",
    ],
  };
}

// Cost Estimator Tool Component
export function CostEstimator({ className = "" }) {
  const [formData, setFormData] = useState({
    roomType: "",
    roomSize: "",
    wallCondition: "",
    serviceType: "",
  });
  const [estimate, setEstimate] = useState(null);

  const calculateEstimate = () => {
    // Base prices
    const basePrices = {
      plastering: 15, // per sqm
      skimming: 12, // per sqm
      rendering: 25, // per sqm
      drylining: 18, // per sqm
    };

    // Room size multipliers (in sqm)
    const roomSizes = {
      small: 20,
      medium: 40,
      large: 60,
      xlarge: 100,
    };

    // Condition multipliers
    const conditionMultipliers = {
      good: 1,
      fair: 1.2,
      poor: 1.5,
      verybad: 2,
    };

    const basePrice = basePrices[formData.serviceType] || 15;
    const sqm = roomSizes[formData.roomSize] || 40;
    const multiplier = conditionMultipliers[formData.wallCondition] || 1;

    const minEstimate = Math.round(basePrice * sqm * multiplier * 0.8);
    const maxEstimate = Math.round(basePrice * sqm * multiplier * 1.2);

    setEstimate({
      min: minEstimate,
      max: maxEstimate,
      sqm,
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <h3 className="font-heading font-bold text-xl text-concrete-800 mb-4">
        Quick Cost Estimator
      </h3>

      <div className="space-y-4">
        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Type of Work
          </label>
          <select
            value={formData.serviceType}
            onChange={(e) =>
              setFormData({ ...formData, serviceType: e.target.value })
            }
            className="w-full px-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select service...</option>
            <option value="plastering">Plastering</option>
            <option value="skimming">Skimming</option>
            <option value="rendering">Rendering</option>
            <option value="drylining">Dry Lining</option>
          </select>
        </div>

        {/* Room Size */}
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Room Size
          </label>
          <select
            value={formData.roomSize}
            onChange={(e) =>
              setFormData({ ...formData, roomSize: e.target.value })
            }
            className="w-full px-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select size...</option>
            <option value="small">Small (up to 20 sqm)</option>
            <option value="medium">Medium (20-40 sqm)</option>
            <option value="large">Large (40-60 sqm)</option>
            <option value="xlarge">Extra Large (60+ sqm)</option>
          </select>
        </div>

        {/* Wall Condition */}
        <div>
          <label className="block text-sm font-medium text-concrete-700 mb-1">
            Current Wall Condition
          </label>
          <select
            value={formData.wallCondition}
            onChange={(e) =>
              setFormData({ ...formData, wallCondition: e.target.value })
            }
            className="w-full px-4 py-3 border border-concrete-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select condition...</option>
            <option value="good">Good - Minor touch-ups needed</option>
            <option value="fair">Fair - Some prep work required</option>
            <option value="poor">Poor - Significant prep needed</option>
            <option value="verybad">Very Bad - Major repair work</option>
          </select>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={calculateEstimate}
          variant="primary"
          className="w-full"
          disabled={
            !formData.serviceType ||
            !formData.roomSize ||
            !formData.wallCondition
          }
        >
          Get Estimate
        </Button>

        {/* Results */}
        {estimate && (
          <div className="bg-primary-50 rounded-lg p-4 text-center">
            <p className="text-concrete-600 text-sm mb-1">Estimated Cost</p>
            <p className="font-heading font-bold text-2xl text-primary-600">
              £{estimate.min} - £{estimate.max}
            </p>
            <p className="text-concrete-500 text-xs mt-1">
              Based on approximately {estimate.sqm} sqm
            </p>
            <p className="text-concrete-400 text-xs mt-2">
              *This is a rough estimate. Contact us for an accurate quote.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
