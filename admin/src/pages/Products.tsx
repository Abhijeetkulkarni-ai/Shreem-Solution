
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Star,
  RefreshCw,
  Eye,

  ChevronDown,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type ProductStatus = "draft" | "published" | "archived";

type Category = {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
};

type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  storage_path: string | null;
  alt_text: string | null;
  sort_order: number;
  is_featured: boolean;
};

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  specifications: Record<string, string>;
  origin_country: string | null;
  target_markets: string[];
  featured_image_url: string | null;
  is_featured: boolean;
  status: ProductStatus;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  created_at: string;
};

type NewImage = {
  id: string;
  file: File;
  preview: string;
};

const emptyForm = {
  name: "",
  slug: "",
  category_id: "",
  short_description: "",
  description: "",
  origin_country: "",
  target_markets: "",
  status: "draft" as ProductStatus,
  is_featured: false,
  sort_order: 0,
  seo_title: "",
  seo_description: "",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [specifications, setSpecifications] = useState<
    { key: string; value: string }[]
  >([{ key: "", value: "" }]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [featuredImageKey, setFeaturedImageKey] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    setError("");

    const [productResult, categoryResult] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
      supabase
        .from("product_categories")
        .select("id, name, is_active, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

    if (productResult.error) {
      setError(productResult.error.message);
      setProducts([]);
    } else {
      setProducts((productResult.data ?? []) as Product[]);
    }

    if (categoryResult.error) {
      setError((current) =>
        current
          ? `${current} | Categories: ${categoryResult.error.message}`
          : `Categories: ${categoryResult.error.message}`,
      );
    } else {
      setCategories((categoryResult.data ?? []) as Category[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    return () => {
      newImages.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [newImages]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.slug.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category_id === categoryFilter;

      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const counts = useMemo(
    () => ({
      total: products.length,
      published: products.filter((item) => item.status === "published").length,
      drafts: products.filter((item) => item.status === "draft").length,
      featured: products.filter((item) => item.is_featured).length,
    }),
    [products],
  );

  const categoryName = (id: string | null) =>
    categories.find((category) => category.id === id)?.name ?? "Uncategorised";

  const resetEditor = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setSpecifications([{ key: "", value: "" }]);
    setExistingImages([]);
    setRemovedImageIds([]);
    setNewImages([]);
    setFeaturedImageKey("");
    setError("");
  };

  const openCreate = () => {
    resetEditor();
    setModalOpen(true);
  };

  const openEdit = async (product: Product) => {
    resetEditor();
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      category_id: product.category_id ?? "",
      short_description: product.short_description ?? "",
      description: product.description ?? "",
      origin_country: product.origin_country ?? "",
      target_markets: (product.target_markets ?? []).join(", "),
      status: product.status,
      is_featured: product.is_featured,
      sort_order: product.sort_order,
      seo_title: product.seo_title ?? "",
      seo_description: product.seo_description ?? "",
    });

    const specEntries = Object.entries(product.specifications ?? {}).map(
      ([key, value]) => ({ key, value: String(value) }),
    );
    setSpecifications(
      specEntries.length ? specEntries : [{ key: "", value: "" }],
    );

    const { data, error: imageError } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true });

    if (imageError) {
      setError(`Could not load product images: ${imageError.message}`);
    } else {
      const images = (data ?? []) as ProductImage[];
      setExistingImages(images);

      const featured = images.find((image) => image.is_featured);
      if (featured) {
        setFeaturedImageKey(`existing:${featured.id}`);
      }
    }

    setModalOpen(true);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const selected = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    const additions = selected.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((current) => [...current, ...additions]);
  };

  const removeNewImage = (id: string) => {
    setNewImages((current) => {
      const image = current.find((item) => item.id === id);
      if (image) URL.revokeObjectURL(image.preview);
      return current.filter((item) => item.id !== id);
    });

    if (featuredImageKey === `new:${id}`) setFeaturedImageKey("");
  };

  const removeExistingImage = (image: ProductImage) => {
    setRemovedImageIds((current) => [...current, image.id]);
    setExistingImages((current) =>
      current.filter((item) => item.id !== image.id),
    );

    if (featuredImageKey === `existing:${image.id}`) {
      setFeaturedImageKey("");
    }
  };

  const saveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    setError("");

    try {
      const specificationsObject = Object.fromEntries(
        specifications
          .filter((item) => item.key.trim())
          .map((item) => [item.key.trim(), item.value.trim()]),
      );

      const markets = form.target_markets
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        name: form.name.trim(),
        slug: slugify(form.slug || form.name),
        category_id: form.category_id || null,
        short_description: form.short_description.trim() || null,
        description: form.description.trim() || null,
        specifications: specificationsObject,
        origin_country: form.origin_country.trim() || null,
        target_markets: markets,
        is_featured: form.is_featured,
        status: form.status,
        sort_order: Number(form.sort_order) || 0,
        seo_title: form.seo_title.trim() || null,
        seo_description: form.seo_description.trim() || null,
      };

      let productId = editingProduct?.id;

      if (editingProduct) {
        const { error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);

        if (updateError) throw updateError;
      } else {
        const { data: userData } = await supabase.auth.getUser();

        const { data, error: insertError } = await supabase
          .from("products")
          .insert({
            ...payload,
            created_by: userData.user?.id ?? null,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;
        productId = data.id;
      }

      if (!productId) throw new Error("Could not identify the saved product.");

      // Remove images that were deleted in the editor.
      const removedImages = existingImages.filter((image) =>
        removedImageIds.includes(image.id),
      );

      for (const image of removedImages) {
        if (image.storage_path) {
          const { error: storageError } = await supabase.storage
            .from("product-images")
            .remove([image.storage_path]);

          if (storageError) throw storageError;
        }
      }

      if (removedImageIds.length) {
        const { error: deleteImageError } = await supabase
          .from("product_images")
          .delete()
          .in("id", removedImageIds);

        if (deleteImageError) throw deleteImageError;
      }

      // Upload newly selected images.
      const uploadedImages: {
        id: string;
        image_url: string;
        storage_path: string;
      }[] = [];

      for (const image of newImages) {
        const safeName = image.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const storagePath = `${productId}/${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(storagePath, image.file, {
            cacheControl: "3600",
            contentType: image.file.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(storagePath);

        uploadedImages.push({
          id: image.id,
          image_url: publicUrlData.publicUrl,
          storage_path: storagePath,
        });
      }

      const allImageKeys = [
        ...existingImages.map((image) => `existing:${image.id}`),
        ...uploadedImages.map((image) => `new:${image.id}`),
      ];

      const chosenFeaturedKey = allImageKeys.includes(featuredImageKey)
        ? featuredImageKey
        : allImageKeys[0] ?? "";

      // Update existing image ordering and featured status.
      for (let index = 0; index < existingImages.length; index += 1) {
        const image = existingImages[index];
        const { error: imageUpdateError } = await supabase
          .from("product_images")
          .update({
            sort_order: index,
            is_featured: chosenFeaturedKey === `existing:${image.id}`,
          })
          .eq("id", image.id);

        if (imageUpdateError) throw imageUpdateError;
      }

      // Save uploaded image records.
      if (uploadedImages.length) {
        const imageRows = uploadedImages.map((image, index) => ({
          product_id: productId,
          image_url: image.image_url,
          storage_path: image.storage_path,
          alt_text: form.name.trim(),
          sort_order: existingImages.length + index,
          is_featured: chosenFeaturedKey === `new:${image.id}`,
        }));

        const { error: imageInsertError } = await supabase
          .from("product_images")
          .insert(imageRows);

        if (imageInsertError) throw imageInsertError;
      }

      // Keep the main product image URL in sync with the selected featured image.
      const featuredExisting = existingImages.find(
        (image) => `existing:${image.id}` === chosenFeaturedKey,
      );
      const featuredNew = uploadedImages.find(
        (image) => `new:${image.id}` === chosenFeaturedKey,
      );

      const featuredUrl =
        featuredExisting?.image_url ??
        featuredNew?.image_url ??
        (existingImages.length
          ? existingImages[0].image_url
          : editingProduct?.featured_image_url ?? null);

      const { error: featuredUpdateError } = await supabase
        .from("products")
        .update({ featured_image_url: featuredUrl })
        .eq("id", productId);

      if (featuredUpdateError) throw featuredUpdateError;

      setModalOpen(false);
      resetEditor();
      await loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This will also delete its image records.`,
    );

    if (!confirmed) return;

    setError("");

    try {
      const { data: images, error: imageFetchError } = await supabase
        .from("product_images")
        .select("storage_path")
        .eq("product_id", product.id);

      if (imageFetchError) throw imageFetchError;

      const paths = (images ?? [])
        .map((image) => image.storage_path)
        .filter((path): path is string => Boolean(path));

      if (paths.length) {
        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove(paths);

        if (storageError) throw storageError;
      }

      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteError) throw deleteError;

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product.");
    }
  };

  // const updateStatus = async (product: Product, status: ProductStatus) => {
  //   const { error: updateError } = await supabase
  //     .from("products")
  //     .update({ status })
  //     .eq("id", product.id);

  //   if (updateError) {
  //     setError(updateError.message);
  //     return;
  //   }

  //   await loadData();
  // };

  return (
    <main className="products-page">
      <div className="page-heading products-heading">
        <div>
          <span className="eyebrow">CATALOGUE MANAGEMENT</span>
          <h1>Products</h1>
          <p>Manage your products, images and catalogue visibility.</p>
        </div>

        <button className="primary-button" onClick={openCreate}>
          <Plus size={17} />
          Add Product
        </button>
      </div>

      {error && (
        <div className="products-error" role="alert">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="product-stats">
        <div className="product-stat-card">
          <span>Total products</span>
          <strong>{counts.total}</strong>
          <Package size={19} />
        </div>
        <div className="product-stat-card">
          <span>Published</span>
          <strong>{counts.published}</strong>
          <Eye size={19} />
        </div>
        <div className="product-stat-card">
          <span>Drafts</span>
          <strong>{counts.drafts}</strong>
          <Pencil size={19} />
        </div>
        <div className="product-stat-card">
          <span>Featured</span>
          <strong>{counts.featured}</strong>
          <Star size={19} />
        </div>
      </section>

      <section className="products-panel">
        <div className="products-toolbar">
          <div className="products-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
            />
          </div>

          <div className="products-filters">
            <label>
              <span className="sr-only">Filter by category</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>

            <label>
              <span className="sr-only">Filter by status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <ChevronDown size={14} />
            </label>

            <button
              className="icon-button"
              onClick={() => void loadData()}
              title="Refresh products"
              aria-label="Refresh products"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="products-table-wrap">
          <table className="products-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>FEATURED</th>
                <th>UPDATED</th>
                <th className="actions-heading">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="products-empty">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="products-empty">
                    <Package size={25} />
                    <strong>No products found</strong>
                    <span>
                      Add your first product or change your search filters.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-name-cell">
                        <div className="product-thumbnail">
                          {product.featured_image_url ? (
                            <img
                              src={product.featured_image_url}
                              alt={product.name}
                            />
                          ) : (
                            <ImageIcon size={19} />
                          )}
                        </div>
                        <div>
                          <strong>{product.name}</strong>
                          <span>/{product.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="product-category">
                        {categoryName(product.category_id)}
                      </span>
                    </td>

                    <td>
                      <span className={`product-status status-${product.status}`}>
                        <span />
                        {product.status}
                      </span>
                    </td>

                    <td>
                      {product.is_featured ? (
                        <span className="featured-label">
                          <Star size={13} fill="currentColor" />
                          Featured
                        </span>
                      ) : (
                        <span className="not-featured">—</span>
                      )}
                    </td>

                    <td className="product-date">
                      {formatDate(product.created_at)}
                    </td>

                    <td>
                      <div className="product-row-actions">
                        <button
                          className="icon-button"
                          title="Edit product"
                          aria-label={`Edit ${product.name}`}
                          onClick={() => void openEdit(product)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="icon-button danger-icon"
                          title="Delete product"
                          aria-label={`Delete ${product.name}`}
                          onClick={() => void deleteProduct(product)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="products-table-footer">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </section>

      {modalOpen && (
        <div
          className="product-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
              resetEditor();
            }
          }}
        >
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <div className="product-modal-header">
              <div>
                <span className="eyebrow">
                  {editingProduct ? "UPDATE CATALOGUE" : "NEW CATALOGUE ITEM"}
                </span>
                <h2 id="product-modal-title">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>
              </div>

              <button
                className="icon-button"
                onClick={() => {
                  if (!saving) {
                    setModalOpen(false);
                    resetEditor();
                  }
                }}
                aria-label="Close editor"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveProduct}>
              <div className="product-modal-body">
                <section className="editor-section">
                  <h3>Basic information</h3>

                  <div className="editor-grid">
                    <label className="editor-field full-field">
                      Product name *
                      <input
                        required
                        value={form.name}
                        onChange={(event) => {
                          const name = event.target.value;
                          setForm((current) => ({
                            ...current,
                            name,
                            slug: editingProduct
                              ? current.slug
                              : slugify(name),
                          }));
                        }}
                        placeholder="e.g. Premium Basmati Rice"
                      />
                    </label>

                    <label className="editor-field">
                      URL slug *
                      <input
                        required
                        value={form.slug}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            slug: slugify(event.target.value),
                          }))
                        }
                        placeholder="premium-basmati-rice"
                      />
                    </label>

                    <label className="editor-field">
                      Category
                      <select
                        value={form.category_id}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            category_id: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="editor-field full-field">
                      Short description
                      <textarea
                        rows={2}
                        value={form.short_description}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            short_description: event.target.value,
                          }))
                        }
                        placeholder="A concise description for product cards..."
                      />
                    </label>

                    <label className="editor-field full-field">
                      Full description
                      <textarea
                        rows={5}
                        value={form.description}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Describe the product, quality, applications and details..."
                      />
                    </label>
                  </div>
                </section>

                <section className="editor-section">
                  <h3>Product images</h3>
                  <p className="editor-help">
                    Upload multiple images. Choose one image as the featured
                    image used in the catalogue.
                  </p>

                  <div className="image-upload-grid">
                    {existingImages.map((image) => (
                      <div className="image-preview-card" key={image.id}>
                        <img src={image.image_url} alt={image.alt_text ?? ""} />
                        <button
                          type="button"
                          className="image-remove"
                          onClick={() => removeExistingImage(image)}
                          aria-label="Remove image"
                        >
                          <X size={14} />
                        </button>
                        <button
                          type="button"
                          className={`image-feature ${featuredImageKey === `existing:${image.id}`
                              ? "image-feature-active"
                              : ""
                            }`}
                          onClick={() =>
                            setFeaturedImageKey(`existing:${image.id}`)
                          }
                        >
                          <Star size={13} />
                          {featuredImageKey === `existing:${image.id}`
                            ? "Featured"
                            : "Set featured"}
                        </button>
                      </div>
                    ))}

                    {newImages.map((image) => (
                      <div className="image-preview-card" key={image.id}>
                        <img src={image.preview} alt={image.file.name} />
                        <button
                          type="button"
                          className="image-remove"
                          onClick={() => removeNewImage(image.id)}
                          aria-label="Remove image"
                        >
                          <X size={14} />
                        </button>
                        <button
                          type="button"
                          className={`image-feature ${featuredImageKey === `new:${image.id}`
                              ? "image-feature-active"
                              : ""
                            }`}
                          onClick={() =>
                            setFeaturedImageKey(`new:${image.id}`)
                          }
                        >
                          <Star size={13} />
                          {featuredImageKey === `new:${image.id}`
                            ? "Featured"
                            : "Set featured"}
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="image-upload-button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={21} />
                      <strong>Add images</strong>
                      <span>JPG, PNG, WEBP</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(event) => {
                      handleFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />
                </section>

                <section className="editor-section">
                  <h3>Trade information</h3>

                  <div className="editor-grid">
                    <label className="editor-field">
                      Country of origin
                      <input
                        value={form.origin_country}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            origin_country: event.target.value,
                          }))
                        }
                        placeholder="e.g. India"
                      />
                    </label>

                    <label className="editor-field">
                      Target markets
                      <input
                        value={form.target_markets}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            target_markets: event.target.value,
                          }))
                        }
                        placeholder="UAE, Saudi Arabia, Oman"
                      />
                      <span className="field-hint">
                        Separate countries with commas.
                      </span>
                    </label>
                  </div>
                </section>

                <section className="editor-section">
                  <div className="editor-section-heading">
                    <div>
                      <h3>Specifications</h3>
                      <p className="editor-help">
                        Add product-specific details as key-value pairs.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        setSpecifications((current) => [
                          ...current,
                          { key: "", value: "" },
                        ])
                      }
                    >
                      <Plus size={15} /> Add row
                    </button>
                  </div>

                  <div className="specification-list">
                    {specifications.map((spec, index) => (
                      <div className="specification-row" key={index}>
                        <input
                          value={spec.key}
                          onChange={(event) =>
                            setSpecifications((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, key: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          placeholder="Specification"
                        />
                        <input
                          value={spec.value}
                          onChange={(event) =>
                            setSpecifications((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, value: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          placeholder="Value"
                        />
                        <button
                          type="button"
                          className="icon-button danger-icon"
                          onClick={() =>
                            setSpecifications((current) =>
                              current.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          aria-label="Remove specification"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="editor-section">
                  <h3>Publishing and visibility</h3>

                  <div className="editor-grid">
                    <label className="editor-field">
                      Publication status
                      <select
                        value={form.status}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            status: event.target.value as ProductStatus,
                          }))
                        }
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </label>

                    <label className="editor-field">
                      Display order
                      <input
                        type="number"
                        value={form.sort_order}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            sort_order: Number(event.target.value),
                          }))
                        }
                      />
                    </label>

                    <label className="editor-checkbox full-field">
                      <input
                        type="checkbox"
                        checked={form.is_featured}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            is_featured: event.target.checked,
                          }))
                        }
                      />
                      <span>
                        <strong>Feature this product</strong>
                        <small>Show this product in featured sections.</small>
                      </span>
                    </label>
                  </div>
                </section>

                <section className="editor-section">
                  <h3>Search engine optimisation</h3>

                  <div className="editor-grid">
                    <label className="editor-field full-field">
                      SEO title
                      <input
                        value={form.seo_title}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            seo_title: event.target.value,
                          }))
                        }
                        placeholder="Search result title"
                      />
                    </label>

                    <label className="editor-field full-field">
                      SEO description
                      <textarea
                        rows={3}
                        value={form.seo_description}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            seo_description: event.target.value,
                          }))
                        }
                        placeholder="Short search engine description..."
                      />
                    </label>
                  </div>
                </section>
              </div>

              <div className="product-modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={saving}
                  onClick={() => {
                    setModalOpen(false);
                    resetEditor();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Save Changes"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
