// BlogEditor Component - Admin Blog Post Editor
"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  FiType,
  FiImage,
  FiTag,
  FiCalendar,
  FiEye,
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiBold,
  FiItalic,
  FiList,
  FiLink,
  FiCode,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiUploadCloud,
  FiCheck,
  FiLoader,
  FiGrid,
} from "react-icons/fi";
import Button from "../common/Button";
import { slugify } from "@/utils/slugify";
import { siteSettings } from "@/config/siteSettings";

const POST_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function BlogEditor({
  post = null,
  categories = [],
  onSubmit,
  onCancel,
  onPreview,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    imageAlt: "",
    category: "",
    tags: [],
    status: "DRAFT",
    publishedAt: "",
    metaTitle: "",
    metaDescription: "",
    readTime: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("content"); // content, seo, media
  const editorRef = useRef(null);

  const blogCategories =
    categories.length > 0 ? categories : siteSettings.blogCategories || [];

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        featuredImage: post.featuredImage || "",
        imageAlt: post.imageAlt || "",
        category: post.category || "",
        tags: post.tags || [],
        status: post.status || "DRAFT",
        publishedAt: post.publishedAt ? post.publishedAt.split("T")[0] : "",
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        readTime: post.readTime || "",
      });
      setAutoSlug(false);
    }
  }, [post]);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: slugify(formData.title),
      }));
    }
  }, [formData.title, autoSlug]);

  // Calculate read time
  useEffect(() => {
    if (formData.content) {
      const wordCount = formData.content.split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200); // 200 words per minute
      setFormData((prev) => ({ ...prev, readTime: readTime.toString() }));
    }
  }, [formData.content]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-set publishedAt when switching to PUBLISHED and no date set
      if (name === "status" && value === "PUBLISHED" && !prev.publishedAt) {
        updated.publishedAt = new Date().toISOString().split("T")[0];
      }
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSlugChange = (e) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Simple text formatting for the content area
  const formatText = (format) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);

    let formattedText = "";
    let cursorOffset = 0;

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case "heading":
        formattedText = `\n## ${selectedText}\n`;
        cursorOffset = 4;
        break;
      case "link":
        formattedText = `[${selectedText}](url)`;
        cursorOffset = selectedText.length + 3;
        break;
      case "list":
        formattedText = `\n- ${selectedText}`;
        cursorOffset = 3;
        break;
      case "code":
        formattedText = `\`${selectedText}\``;
        cursorOffset = 1;
        break;
      default:
        return;
    }

    const newContent =
      formData.content.substring(0, start) +
      formattedText +
      formData.content.substring(end);

    setFormData((prev) => ({ ...prev, content: newContent }));

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + cursorOffset,
        start + cursorOffset + selectedText.length,
      );
    }, 0);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
    if (formData.status === "PUBLISHED" && !formData.category) {
      newErrors.category = "Category is required for published posts";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-concrete-200">
        <div className="flex gap-4">
          {["content", "seo", "media"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "text-primary-600 border-primary-500"
                  : "text-concrete-500 border-transparent hover:text-concrete-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-concrete-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 text-xl border rounded-lg ${errors.title ? "border-red-300" : "border-concrete-300"} focus:ring-2 focus:ring-primary-500`}
              placeholder="Enter post title..."
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-concrete-700 mb-1">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-concrete-500">/blog/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                className={`flex-1 px-4 py-2 border rounded-lg ${errors.slug ? "border-red-300" : "border-concrete-300"} focus:ring-2 focus:ring-primary-500`}
                placeholder="post-url-slug"
              />
            </div>
            {errors.slug && (
              <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-concrete-700 mb-1">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Brief summary that appears in blog listings..."
            />
            <p className="text-sm text-concrete-500 mt-1">
              {formData.excerpt.length}/160 characters
            </p>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-concrete-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>

            {/* Formatting Toolbar */}
            <div className="flex gap-1 p-2 bg-concrete-50 rounded-t-lg border border-b-0 border-concrete-300">
              <button
                type="button"
                onClick={() => formatText("bold")}
                className="p-2 hover:bg-concrete-200 rounded"
                title="Bold"
              >
                <FiBold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => formatText("italic")}
                className="p-2 hover:bg-concrete-200 rounded"
                title="Italic"
              >
                <FiItalic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => formatText("heading")}
                className="p-2 hover:bg-concrete-200 rounded"
                title="Heading"
              >
                <FiType className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => formatText("list")}
                className="p-2 hover:bg-concrete-200 rounded"
                title="List"
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => formatText("link")}
                className="p-2 hover:bg-concrete-200 rounded"
                title="Link"
              >
                <FiLink className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => formatText("code")}
                className="p-2 hover:bg-concrete-200 rounded"
                title="Code"
              >
                <FiCode className="w-4 h-4" />
              </button>
            </div>

            <textarea
              ref={editorRef}
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              className={`w-full px-4 py-3 border rounded-b-lg font-mono text-sm ${errors.content ? "border-red-300" : "border-concrete-300"} focus:ring-2 focus:ring-primary-500 resize-y`}
              placeholder="Write your blog post content here... (Markdown supported)"
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
            <p className="text-sm text-concrete-500 mt-1">
              ~{formData.readTime || 0} min read (
              {formData.content.split(/\s+/).filter(Boolean).length} words)
            </p>
          </div>

          {/* Category & Status */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-concrete-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${errors.category ? "border-red-300" : "border-concrete-300"} focus:ring-2 focus:ring-primary-500`}
              >
                <option value="">Select category...</option>
                {blogCategories.map((cat) => (
                  <option key={cat.id || cat.slug} value={cat.id || cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-concrete-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {POST_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Publish Date */}
          {(formData.status === "SCHEDULED" ||
            formData.status === "PUBLISHED") && (
            <div>
              <label className="block text-sm font-medium text-concrete-700 mb-1">
                {formData.status === "SCHEDULED" ? "Scheduled" : "Published"}{" "}
                Date
              </label>
              <input
                type="date"
                name="publishedAt"
                value={formData.publishedAt}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-concrete-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Add a tag..."
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <FiPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-concrete-700 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder={formData.title || "Leave blank to use post title"}
            />
            <p className="text-sm text-concrete-500 mt-1">
              {(formData.metaTitle || formData.title).length}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-concrete-700 mb-1">
              Meta Description
            </label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder={formData.excerpt || "Leave blank to use excerpt"}
            />
            <p className="text-sm text-concrete-500 mt-1">
              {(formData.metaDescription || formData.excerpt).length}/160
              characters
            </p>
          </div>

          {/* SEO Preview */}
          <div className="bg-concrete-50 rounded-lg p-4">
            <h4 className="font-medium text-concrete-700 mb-3">
              Search Preview
            </h4>
            <div className="bg-white p-4 rounded border border-concrete-200">
              <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                {formData.metaTitle || formData.title || "Post Title"}
              </p>
              <p className="text-green-700 text-sm">
                pubbleplastering.co.uk/blog/{formData.slug || "post-slug"}
              </p>
              <p className="text-concrete-600 text-sm mt-1 line-clamp-2">
                {formData.metaDescription ||
                  formData.excerpt ||
                  "Post description will appear here..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Media Tab */}
      {activeTab === "media" && (
        <MediaTab
          featuredImage={formData.featuredImage}
          imageAlt={formData.imageAlt}
          onChange={handleChange}
          onImageSelect={(url) =>
            setFormData((prev) => ({ ...prev, featuredImage: url }))
          }
        />
      )}

      {/* Actions */}
      <div className="flex flex-wrap justify-between gap-3 pt-4 border-t">
        <div>
          {onPreview && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onPreview(formData)}
            >
              <FiEye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <FiX className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="outline"
            onClick={() =>
              setFormData((prev) => ({ ...prev, status: "DRAFT" }))
            }
          >
            Save Draft
          </Button>
          <Button type="submit" loading={isLoading}>
            <FiSave className="w-4 h-4 mr-2" />
            {post ? "Update Post" : "Publish Post"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ─── Media Tab with Upload + Library ────────────────────────
function MediaTab({ featuredImage, imageAlt, onChange, onImageSelect }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryImages, setLibraryImages] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "blog");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.files && data.files.length > 0) {
          onImageSelect(data.files[0].url);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const loadLibrary = async () => {
    setShowLibrary(true);
    setLoadingLibrary(true);
    try {
      const res = await fetch("/api/media?limit=50");
      if (res.ok) {
        const data = await res.json();
        setLibraryImages(data.media || []);
      }
    } catch (err) {
      console.error("Error loading library:", err);
    } finally {
      setLoadingLibrary(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div>
        <label className="block text-sm font-medium text-concrete-700 mb-2">
          Featured Image
        </label>

        {featuredImage ? (
          <div className="relative rounded-lg overflow-hidden bg-concrete-100 border border-concrete-200">
            <div className="relative aspect-video">
              <img
                src={featuredImage}
                alt={imageAlt || "Featured"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "";
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white/90 backdrop-blur text-sm font-medium rounded-lg shadow hover:bg-white transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onImageSelect("")}
                className="px-3 py-1.5 bg-red-500/90 backdrop-blur text-white text-sm font-medium rounded-lg shadow hover:bg-red-600 transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-3 py-1.5">
              <p className="text-white text-xs truncate">{featuredImage}</p>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-primary-500 bg-primary-50"
                : "border-concrete-300 hover:border-primary-400 hover:bg-concrete-50"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <FiLoader className="w-10 h-10 text-primary-500 animate-spin" />
                <p className="text-sm text-concrete-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <FiUploadCloud className="w-10 h-10 text-concrete-400" />
                <div>
                  <p className="font-medium text-concrete-700">
                    Drag & drop an image here
                  </p>
                  <p className="text-sm text-concrete-500 mt-1">
                    or click to browse &bull; PNG, JPG, WebP up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* Browse Library Button */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={loadLibrary}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-concrete-300 rounded-lg hover:bg-concrete-50 transition-colors"
        >
          <FiGrid className="w-4 h-4" />
          Browse Media Library
        </button>
      </div>

      {/* Media Library */}
      {showLibrary && (
        <div className="border border-concrete-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-concrete-50 border-b border-concrete-200">
            <p className="font-medium text-sm text-concrete-700">
              Media Library
            </p>
            <button
              type="button"
              onClick={() => setShowLibrary(false)}
              className="text-concrete-400 hover:text-concrete-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 max-h-72 overflow-y-auto">
            {loadingLibrary ? (
              <div className="flex justify-center py-8">
                <FiLoader className="w-6 h-6 animate-spin text-concrete-400" />
              </div>
            ) : libraryImages.length === 0 ? (
              <p className="text-center text-concrete-500 py-8 text-sm">
                No images in library yet. Upload one above.
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {libraryImages.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => {
                      onImageSelect(img.url);
                      setShowLibrary(false);
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 ${
                      featuredImage === img.url
                        ? "border-primary-500 ring-2 ring-primary-200"
                        : "border-transparent hover:border-concrete-300"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || img.originalName}
                      className="w-full h-full object-cover"
                    />
                    {featuredImage === img.url && (
                      <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                        <FiCheck className="w-5 h-5 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alt Text */}
      <div>
        <label className="block text-sm font-medium text-concrete-700 mb-1">
          Image Alt Text
        </label>
        <input
          type="text"
          name="imageAlt"
          value={imageAlt}
          onChange={onChange}
          className="w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Describe the image for accessibility..."
        />
      </div>

      {/* Manual URL fallback */}
      <details className="text-sm">
        <summary className="cursor-pointer text-concrete-500 hover:text-concrete-700">
          Or enter image URL manually
        </summary>
        <input
          type="text"
          name="featuredImage"
          value={featuredImage}
          onChange={onChange}
          className="mt-2 w-full px-4 py-2 border border-concrete-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
          placeholder="/uploads/blog/image.jpg"
        />
      </details>
    </div>
  );
}
