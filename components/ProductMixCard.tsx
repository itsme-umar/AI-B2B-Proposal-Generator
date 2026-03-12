import type { SustainableProductItem } from "@/types/proposal";

interface ProductMixCardProps {
  product: SustainableProductItem;
  index: number;
}

export default function ProductMixCard({ product, index }: ProductMixCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
          {index + 1}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {product.category}
        </span>
      </div>
      <h4 className="mb-2 font-semibold text-slate-800">{product.product_name}</h4>
      <p className="text-sm text-slate-600 leading-relaxed">{product.reason}</p>
    </div>
  );
}
