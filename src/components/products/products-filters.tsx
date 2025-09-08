'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Search, X, Filter, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface ProductsFiltersProps {
  categories: Category[];
  brands: Brand[];
  searchParams: any;
}

export function ProductsFilters({ categories, brands, searchParams }: ProductsFiltersProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '');
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.minPrice || '0'),
    parseInt(searchParams.maxPrice || '10000'),
  ]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const updateSearchParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to first page when changing filters
    router.push(`/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams('search', searchTerm || null);
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    updateSearchParams('minPrice', values[0] > 0 ? values[0].toString() : null);
    updateSearchParams('maxPrice', values[1] < 10000 ? values[1].toString() : null);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 10000]);
    router.push('/products');
  };

  const activeFiltersCount = [
    searchParams.search,
    searchParams.category,
    searchParams.brand,
    searchParams.minPrice,
    searchParams.maxPrice,
    searchParams.inStock,
  ].filter(Boolean).length;

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search Products</Label>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" size="icon" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Separator />

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Active Filters ({activeFiltersCount})</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchParams.search && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchParams.search}
                <button
                  onClick={() => updateSearchParams('search', null)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchParams.category && (
              <Badge variant="secondary" className="gap-1">
                Category: {categories.find(c => c.slug === searchParams.category)?.name}
                <button
                  onClick={() => updateSearchParams('category', null)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchParams.brand && (
              <Badge variant="secondary" className="gap-1">
                Brand: {brands.find(b => b.slug === searchParams.brand)?.name}
                <button
                  onClick={() => updateSearchParams('brand', null)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchParams.inStock && (
              <Badge variant="secondary" className="gap-1">
                In Stock Only
                <button
                  onClick={() => updateSearchParams('inStock', null)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Categories */}
      <div className="space-y-2">
        <Label>Categories</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.slug}`}
                checked={searchParams.category === category.slug}
                onCheckedChange={(checked) => {
                  updateSearchParams('category', checked ? category.slug : null);
                }}
              />
              <Label
                htmlFor={`category-${category.slug}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {category.name} ({category._count.products})
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brands */}
      <div className="space-y-2">
        <Label>Brands</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.slug}`}
                checked={searchParams.brand === brand.slug}
                onCheckedChange={(checked) => {
                  updateSearchParams('brand', checked ? brand.slug : null);
                }}
              />
              <Label
                htmlFor={`brand-${brand.slug}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {brand.name} ({brand._count.products})
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-4">
        <Label>Price Range</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            max={10000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Stock Status */}
      <div className="space-y-2">
        <Label>Availability</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={searchParams.inStock === 'true'}
            onCheckedChange={(checked) => {
              updateSearchParams('inStock', checked ? 'true' : null);
            }}
          />
          <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
            In stock only
          </Label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
      </div>

      {/* Desktop Filters */}
      <Card className="hidden lg:block sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FiltersContent />
        </CardContent>
      </Card>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <Card className="lg:hidden mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <FiltersContent />
          </CardContent>
        </Card>
      )}
    </>
  );
}