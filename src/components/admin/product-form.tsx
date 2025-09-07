'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Save, Eye, Archive } from 'lucide-react';
import { slugify } from '@/lib/utils';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  compareAtPrice: z.number().optional(),
  cost: z.number().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  trackQuantity: z.boolean().default(true),
  quantity: z.number().min(0, 'Quantity cannot be negative').default(0),
  allowBackorder: z.boolean().default(false),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional(),
  images: z.array(z.string()).default([]),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    sku: z.string().optional(),
    price: z.number().min(0.01, 'Price must be greater than 0'),
    quantity: z.number().min(0, 'Quantity cannot be negative').default(0),
    options: z.array(z.object({
      name: z.string().min(1, 'Option name is required'),
      value: z.string().min(1, 'Option value is required'),
    })).default([]),
  })).default([]),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: any;
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
  onSubmit?: (data: ProductFormData) => Promise<void>;
}

export function ProductForm({ product, categories, brands, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      cost: product.cost,
      sku: product.sku,
      barcode: product.barcode,
      trackQuantity: product.trackQuantity,
      quantity: product.quantity,
      allowBackorder: product.allowBackorder,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      status: product.status,
      categoryId: product.categoryId,
      brandId: product.brandId,
      images: product.images?.map((img: any) => img.url) || [],
      variants: product.variants || [],
    } : {
      name: '',
      slug: '',
      description: '',
      price: 0,
      trackQuantity: true,
      quantity: 0,
      allowBackorder: false,
      status: 'DRAFT',
      categoryId: '',
      images: [],
      variants: [],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  const watchName = watch('name');
  const watchStatus = watch('status');
  const watchImages = watch('images');

  // Auto-generate slug from name
  useEffect(() => {
    if (watchName && !product) {
      setValue('slug', slugify(watchName));
    }
  }, [watchName, setValue, product]);

  const handleFormSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        const url = product ? `/api/products/${product.slug}` : '/api/products';
        const method = product ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save product');
        }

        const result = await response.json();
        toast.success(product ? 'Product updated successfully' : 'Product created successfully');
        
        if (!product) {
          router.push(`/admin/products/${result.slug}`);
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  const addVariant = () => {
    appendVariant({
      name: '',
      sku: '',
      price: watch('price') || 0,
      quantity: 0,
      options: [],
    });
  };

  const addVariantOption = (variantIndex: number) => {
    const variant = variantFields[variantIndex];
    const newOptions = [...(variant.options || []), { name: '', value: '' }];
    setValue(`variants.${variantIndex}.options`, newOptions);
  };

  const removeVariantOption = (variantIndex: number, optionIndex: number) => {
    const variant = variantFields[variantIndex];
    const newOptions = variant.options?.filter((_, i) => i !== optionIndex) || [];
    setValue(`variants.${variantIndex}.options`, newOptions);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {product ? 'Edit Product' : 'Create Product'}
          </h1>
          <p className="text-muted-foreground">
            {product ? 'Update product information and settings' : 'Add a new product to your store'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          
          <Button type="submit" loading={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {product ? 'Update' : 'Create'} Product
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential product details that customers will see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    error={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    error={!!errors.slug}
                  />
                  {errors.slug && (
                    <p className="text-sm text-destructive">{errors.slug.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  rows={5}
                  {...register('description')}
                  error={!!errors.description}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Set your product pricing and cost information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                    error={!!errors.price}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Compare at Price</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('compareAtPrice', { valueAsNumber: true })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost per Item</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('cost', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>
                Manage product inventory and tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    {...register('sku')}
                    placeholder="e.g., SHIRT-RED-L"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    {...register('barcode')}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="trackQuantity"
                  {...register('trackQuantity')}
                />
                <Label htmlFor="trackQuantity">Track quantity</Label>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    {...register('quantity', { valueAsNumber: true })}
                    error={!!errors.quantity}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-destructive">{errors.quantity.message}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="allowBackorder"
                    {...register('allowBackorder')}
                  />
                  <Label htmlFor="allowBackorder">Allow backorders</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Add high-quality images to showcase your product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                value={watchImages}
                onChange={(urls) => setValue('images', urls)}
                maxFiles={10}
                maxSize={5}
              />
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>
                    Add different variations of your product (size, color, etc.)
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={addVariant}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {variantFields.map((variant, variantIndex) => (
                <Card key={variant.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Variant {variantIndex + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(variantIndex)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Variant Name *</Label>
                        <Input
                          {...register(`variants.${variantIndex}.name`)}
                          placeholder="e.g., Large Red"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>SKU</Label>
                        <Input
                          {...register(`variants.${variantIndex}.sku`)}
                          placeholder="e.g., SHIRT-RED-L"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Price *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register(`variants.${variantIndex}.price`, { valueAsNumber: true })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          {...register(`variants.${variantIndex}.quantity`, { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                    
                    {/* Variant Options */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-medium">Options</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addVariantOption(variantIndex)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {variant.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <Input
                              placeholder="Option name (e.g., Color)"
                              {...register(`variants.${variantIndex}.options.${optionIndex}.name`)}
                            />
                            <Input
                              placeholder="Option value (e.g., Red)"
                              {...register(`variants.${variantIndex}.options.${optionIndex}.value`)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariantOption(variantIndex, optionIndex)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Publication Status</Label>
                <Select
                  value={watchStatus}
                  onValueChange={(value) => setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Draft</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="PUBLISHED">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Published</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="ARCHIVED">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Archived</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={watch('categoryId')}
                  onValueChange={(value) => setValue('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select
                  value={watch('brandId') || ''}
                  onValueChange={(value) => setValue('brandId', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No brand</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>
                Optimize your product for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  {...register('metaTitle')}
                  placeholder="SEO title (max 60 characters)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {watch('metaTitle')?.length || 0}/60 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  rows={3}
                  {...register('metaDescription')}
                  placeholder="SEO description (max 160 characters)"
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  {watch('metaDescription')?.length || 0}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}