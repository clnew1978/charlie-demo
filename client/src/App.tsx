import { useState, Dispatch, SetStateAction } from "react";
import "./App.css";

interface Product { category: string; price: string; stocked: boolean; name: string; }

function ProductCategoryRow({ category }: { category: string }) {
  return (
    <tr>
      <th colSpan={2}>{category}</th>
    </tr>
  );
}

function ProductRow({ product }: { product: Product }) {
  const productName = product.stocked ? product.name : <span style={{ color: 'red' }}>{product.name}</span>;
  return (<tr>
    <td>{productName}</td>
    <td>{product.price}</td>
  </tr>);
}

function ProductTable({ products, filterText, inStockOnly }: { products: Product[], filterText: string, inStockOnly: boolean }) {
  const rows: any[] = [];
  let lastCategory: string;
  if (filterText) {
    filterText = filterText.toLowerCase();
    products = products.filter((p) => p.name.toLowerCase().includes(filterText));
  }
  if (inStockOnly) {
    products = products.filter((p) => p.stocked);
  }
  products = products.sort((p1, p2) => {
    if (p1.category !== p2.category) {
      return p1.category.localeCompare(p2.category);
    }
    return p1.name.localeCompare(p2.name);
  });
  products.forEach((p) => {
    if (p.category !== lastCategory) {
      rows.push(<ProductCategoryRow category={p.category} key={p.category}></ProductCategoryRow>);
    }
    rows.push(<ProductRow product={p} key={p.name}></ProductRow>);
    lastCategory = p.category;
  });

  return (
    <table>
      <thead>
        <tr><th>Name</th><th>Price</th></tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function SearchBar({ filterText, onFilterTextChange, inStockOnly, onInStockOnlyChange }: {
  filterText: string,
  onFilterTextChange: Dispatch<SetStateAction<string>>,
  inStockOnly: boolean,
  onInStockOnlyChange: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <div>
      <p>{process.env.REACT_APP_NOT_SECRET_CODE}</p>
      <form>
        <input type="text" value={filterText} placeholder="Search..." onChange={(e) => onFilterTextChange(e.target.value)} />
      </form>
      <form>
        <label>
          <input type="checkbox" checked={inStockOnly} onChange={(e) => onInStockOnlyChange(e.target.checked)} />
          {'  '} Only show products in stock
        </label>
      </form>
    </div>
  );
}

function FilterableProductTable({ products }: { products: Product[] }) {
  const [filterText, setFilterText] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  return (<div style={{ width: '16em' }}>
    <SearchBar filterText={filterText} onFilterTextChange={setFilterText} inStockOnly={inStockOnly} onInStockOnlyChange={setInStockOnly} />
    <ProductTable products={products} filterText={filterText} inStockOnly={inStockOnly} />
  </div>);
}

const PRODUCTS = [
  { category: "Fruits", price: "$1", stocked: true, name: "Apple" },
  { category: "Fruits", price: "$1", stocked: true, name: "Dragonfruit" },
  { category: "Fruits", price: "$2", stocked: false, name: "Passionfruit" },
  { category: "Vegetables", price: "$2", stocked: true, name: "Spinach" },
  { category: "Vegetables", price: "$4", stocked: false, name: "Pumpkin" },
  { category: "Vegetables", price: "$1", stocked: true, name: "Peas" },
];

function App() {
  return (<FilterableProductTable products={PRODUCTS} />);
}

export default App;
