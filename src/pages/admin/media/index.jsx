// Admin Media Library Page - Fully Functional
import React, { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import {
  FiUpload,
  FiSearch,
  FiTrash2,
  FiCopy,
  FiImage,
  FiGrid,
  FiList,
  FiCheck,
  FiLoader,
  FiX,
  FiEdit2,
  FiFolder,
  FiRefreshCw,
  FiDownload,
  FiMaximize2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import AdminLayout from "@/components/admin/AdminLayout";
import { siteSettings } from "@/config/siteSettings";

const FOLDERS = [
  { value: "all", label: "All Files" },
  { value: "general", label: "General" },
  { value: "blog", label: "Blog" },
  { value: "projects", label: "Projects" },
  { value: "clients", label: "Clients" },
  { value: "quotes", label: "Quotes" },
];

export default function MediaLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedItems, setSelectedItems] = useState([]);
  const [media, setMedia] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [folder, setFolder] = useState("all");
  const [uploadFolder, setUploadFolder] = useState("general");
  const [dragging, setDragging] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [editingAlt, setEditingAlt] = useState(null);
  const [altText, setAltText] = useState("");
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (folder !== "all") params.append("folder", folder);
      if (searchQuery) params.append("search", searchQuery);
      params.append("limit", "200");

      const res = await fetch(`/api/media?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  }, [folder, searchQuery]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(fetchMedia, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);

    let completed = 0;
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", uploadFolder);
      try {
        await fetch("/api/upload", { method: "POST", body: formData });
      } catch (err) {
        console.error("Upload error:", err);
      }
      completed++;
      setUploadProgress(Math.round((completed / files.length) * 100));
    }

    setUploading(false);
    setUploadProgress(0);
    fetchMedia();
  };

  const handleUpload = (e) => {
    uploadFiles(e.target.files);
    e.target.value = "";
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === dropRef.current) setDragging(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const filteredMedia = media.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.originalName || "").toLowerCase().includes(q) ||
      (item.filename || "").toLowerCase().includes(q) ||
      (item.altText || "").toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredMedia.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredMedia.map((m) => m.id));
    }
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (ids) => {
    if (!confirm(`Delete ${ids.length} file(s)? This cannot be undone.`))
      return;
    for (const id of ids) {
      try {
        await fetch(`/api/media/${id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
    setMedia((prev) => prev.filter((m) => !ids.includes(m.id)));
    setSelectedItems([]);
    if (lightbox && ids.includes(lightbox.id)) setLightbox(null);
  };

  const saveAltText = async (id) => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText }),
      });
      if (res.ok) {
        setMedia((prev) =>
          prev.map((m) => (m.id === id ? { ...m, altText } : m)),
        );
        if (lightbox?.id === id) setLightbox((prev) => ({ ...prev, altText }));
      }
    } catch (err) {
      console.error("Error saving alt text:", err);
    }
    setEditingAlt(null);
  };

  const formatSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const totalSize = media.reduce((sum, m) => sum + (m.size || 0), 0);
  const folderCounts = media.reduce((acc, m) => {
    acc[m.folder || "general"] = (acc[m.folder || "general"] || 0) + 1;
    return acc;
  }, {});

  // Lightbox navigation
  const openLightbox = (item) => setLightbox(item);
  const closeLightbox = () => {
    setLightbox(null);
    setEditingAlt(null);
  };
  const navigateLightbox = (dir) => {
    const idx = filteredMedia.findIndex((m) => m.id === lightbox?.id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next >= 0 && next < filteredMedia.length) {
      setLightbox(filteredMedia[next]);
      setEditingAlt(null);
    }
  };

  // Keyboard nav for lightbox
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateLightbox(-1);
      if (e.key === "ArrowRight") navigateLightbox(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, filteredMedia]);

  return (
    <>
      <Head>
        <title>
          Media Library | Admin -{" "}
          {siteSettings.company?.name || "Pubble Plastering"}
        </title>
      </Head>

      <AdminLayout title="Media Library">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-concrete-800">
              {media.length}
            </div>
            <div className="text-sm text-concrete-500">Total Files</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-concrete-800">
              {formatSize(totalSize)}
            </div>
            <div className="text-sm text-concrete-500">Total Size</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-primary-600">
              {folderCounts.projects || 0}
            </div>
            <div className="text-sm text-concrete-500">Project Images</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {folderCounts.blog || 0}
            </div>
            <div className="text-sm text-concrete-500">Blog Images</div>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          ref={dropRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 mb-6 text-center transition-all ${
            dragging
              ? "border-primary-500 bg-primary-50"
              : "border-concrete-200 bg-white hover:border-concrete-300"
          }`}
        >
          {uploading ? (
            <div className="space-y-3">
              <FiLoader className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
              <p className="text-concrete-600">
                Uploading... {uploadProgress}%
              </p>
              <div className="w-48 mx-auto bg-concrete-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <FiUpload className="w-8 h-8 text-concrete-400 mx-auto" />
              <div>
                <p className="text-concrete-600">
                  Drag & drop images here or{" "}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-sm text-concrete-400 mt-1">
                  PNG, JPG, WebP up to 10MB each
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <label className="text-sm text-concrete-500">Upload to:</label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="text-sm border border-concrete-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500"
                >
                  {FOLDERS.filter((f) => f.value !== "all").map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleUpload}
              />
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 border border-concrete-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Folder Filter */}
            <div className="flex gap-1 overflow-x-auto">
              {FOLDERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFolder(f.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    folder === f.value
                      ? "bg-primary-600 text-white"
                      : "bg-white text-concrete-600 hover:bg-concrete-100 border border-concrete-200"
                  }`}
                >
                  {f.label}
                  {f.value !== "all" && folderCounts[f.value] ? (
                    <span className="ml-1 text-xs opacity-75">
                      ({folderCounts[f.value]})
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedItems.length > 0 && (
              <>
                <span className="text-sm text-concrete-500">
                  {selectedItems.length} selected
                </span>
                <button
                  onClick={() => handleDelete(selectedItems)}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 text-sm"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}

            <button
              onClick={selectAll}
              className="px-3 py-2 border border-concrete-200 text-concrete-600 rounded-lg hover:bg-concrete-50 text-sm"
            >
              {selectedItems.length === filteredMedia.length &&
              filteredMedia.length > 0
                ? "Deselect All"
                : "Select All"}
            </button>

            <div className="flex items-center bg-white border border-concrete-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-primary-50 text-primary-600" : "text-concrete-500"}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-primary-50 text-primary-600" : "text-concrete-500"}`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={fetchMedia}
              className="p-2 border border-concrete-200 rounded-lg hover:bg-concrete-50"
              title="Refresh"
            >
              <FiRefreshCw
                className={`w-5 h-5 text-concrete-500 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Media Content */}
        {loading && media.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <FiImage className="w-16 h-16 text-concrete-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-concrete-500 mb-2">
              {searchQuery ? "No Matching Files" : "No Media Files Yet"}
            </h3>
            <p className="text-concrete-400 text-sm mb-6">
              {searchQuery
                ? "Try a different search term."
                : "Upload images by dragging them above or clicking browse."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden group relative ${
                  selectedItems.includes(item.id)
                    ? "ring-2 ring-primary-500"
                    : ""
                }`}
              >
                <div
                  className="aspect-square bg-concrete-100 relative overflow-hidden cursor-pointer"
                  onClick={() => openLightbox(item)}
                >
                  <img
                    src={item.url}
                    alt={item.altText || item.originalName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Selection Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.id);
                    }}
                    className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      selectedItems.includes(item.id)
                        ? "bg-primary-600 border-primary-600 text-white"
                        : "bg-white/80 border-concrete-300 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {selectedItems.includes(item.id) && (
                      <FiCheck className="w-4 h-4" />
                    )}
                  </button>

                  {/* Folder badge */}
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded-full capitalize opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.folder || "general"}
                  </span>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(item);
                      }}
                      className="p-2 bg-white rounded-lg text-concrete-700 hover:bg-concrete-100"
                      title="Preview"
                    >
                      <FiMaximize2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(item.url, item.id);
                      }}
                      className="p-2 bg-white rounded-lg text-concrete-700 hover:bg-concrete-100"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? (
                        <FiCheck className="w-5 h-5 text-green-600" />
                      ) : (
                        <FiCopy className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete([item.id]);
                      }}
                      className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p
                    className="text-sm font-medium text-concrete-800 truncate"
                    title={item.originalName}
                  >
                    {item.originalName}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-concrete-400">
                      {formatSize(item.size)}
                    </p>
                    <p className="text-xs text-concrete-400">
                      {new Date(item.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-concrete-50 border-b border-concrete-200">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={
                        selectedItems.length === filteredMedia.length &&
                        filteredMedia.length > 0
                      }
                      onChange={selectAll}
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-concrete-600">
                    Preview
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-concrete-600">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-concrete-600">
                    Folder
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-concrete-600">
                    Size
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-concrete-600">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-concrete-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-100">
                {filteredMedia.map((item) => (
                  <tr key={item.id} className="hover:bg-concrete-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="w-12 h-12 bg-concrete-100 rounded overflow-hidden cursor-pointer"
                        onClick={() => openLightbox(item)}
                      >
                        <img
                          src={item.url}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-concrete-800 text-sm">
                        {item.originalName}
                      </p>
                      {item.altText && (
                        <p className="text-xs text-concrete-400 truncate max-w-[200px]">
                          {item.altText}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-concrete-100 text-concrete-600 rounded-full text-xs capitalize">
                        {item.folder || "general"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-concrete-500">
                      {formatSize(item.size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-concrete-500">
                      {new Date(item.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openLightbox(item)}
                          className="p-2 text-concrete-500 hover:text-primary-600 rounded"
                          title="Preview"
                        >
                          <FiMaximize2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyUrl(item.url, item.id)}
                          className="p-2 text-concrete-500 hover:text-primary-600 rounded"
                          title="Copy URL"
                        >
                          {copiedId === item.id ? (
                            <FiCheck className="w-4 h-4 text-green-600" />
                          ) : (
                            <FiCopy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete([item.id])}
                          className="p-2 text-concrete-500 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminLayout>

      {/* Lightbox / Image Detail Overlay */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <a
              href={lightbox.url}
              download
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              title="Download"
            >
              <FiDownload className="w-5 h-5" />
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyUrl(lightbox.url, lightbox.id);
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              title="Copy URL"
            >
              {copiedId === lightbox.id ? (
                <FiCheck className="w-5 h-5 text-green-400" />
              ) : (
                <FiCopy className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete([lightbox.id]);
              }}
              className="p-2 bg-white/10 hover:bg-red-500/50 rounded-lg text-white"
              title="Delete"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
            <button
              onClick={closeLightbox}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox(-1);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-10"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox(1);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-10"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>

          {/* Image + Details */}
          <div
            className="flex flex-col lg:flex-row max-w-6xl max-h-[90vh] w-full mx-4 gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              <img
                src={lightbox.url}
                alt={lightbox.altText || lightbox.originalName}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            {/* Details Sidebar */}
            <div className="lg:w-72 bg-white rounded-xl p-5 space-y-4 overflow-y-auto max-h-[70vh]">
              <h3
                className="font-semibold text-concrete-800 truncate"
                title={lightbox.originalName}
              >
                {lightbox.originalName}
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-concrete-500">Size</span>
                  <span className="text-concrete-800">
                    {formatSize(lightbox.size)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-concrete-500">Type</span>
                  <span className="text-concrete-800">{lightbox.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-concrete-500">Folder</span>
                  <span className="text-concrete-800 capitalize">
                    {lightbox.folder || "general"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-concrete-500">Uploaded</span>
                  <span className="text-concrete-800">
                    {new Date(lightbox.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Alt Text Editor */}
              <div>
                <label className="block text-sm font-medium text-concrete-700 mb-1">
                  Alt Text
                </label>
                {editingAlt === lightbox.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      className="w-full px-3 py-2 border border-concrete-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      placeholder="Describe this image..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveAltText(lightbox.id)}
                        className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAlt(null)}
                        className="px-3 py-1 bg-concrete-100 text-concrete-600 text-sm rounded-lg hover:bg-concrete-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingAlt(lightbox.id);
                      setAltText(lightbox.altText || "");
                    }}
                    className="w-full text-left px-3 py-2 bg-concrete-50 rounded-lg text-sm text-concrete-600 hover:bg-concrete-100 flex items-center justify-between"
                  >
                    <span className="truncate">
                      {lightbox.altText || "Add alt text..."}
                    </span>
                    <FiEdit2 className="w-4 h-4 flex-shrink-0 ml-2" />
                  </button>
                )}
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-concrete-700 mb-1">
                  URL
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    readOnly
                    value={lightbox.url}
                    className="w-full px-3 py-2 bg-concrete-50 border border-concrete-200 rounded-lg text-xs text-concrete-600"
                  />
                  <button
                    onClick={() => copyUrl(lightbox.url, lightbox.id)}
                    className="px-3 py-2 bg-concrete-100 rounded-lg hover:bg-concrete-200"
                  >
                    {copiedId === lightbox.id ? (
                      <FiCheck className="w-4 h-4 text-green-600" />
                    ) : (
                      <FiCopy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
