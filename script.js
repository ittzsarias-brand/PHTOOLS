const products = [
  {id:1,brand:"Ronix",name:"دریلی بێسیم 18V",category:"Power Tools",price:89.99,tag:"فرۆشراوی زۆر",mark:"DRILL"},
  {id:2,brand:"Milwaukee",name:"Impact Driver ـی M18",category:"Power Tools",price:149.99,tag:"پیشەیی",mark:"M18"},
  {id:3,brand:"Velloo",name:"گرایندەری قورس",category:"Power Tools",price:74.50,tag:"نوێ",mark:"GRIND"},
  {id:4,brand:"PH.Tools",name:"جعبەی ئامرازی پیشەیی",category:"Hand Tools",price:54.99,tag:"",mark:"BOX"},
  {id:5,brand:"PH.Tools",name:"پێوانەی دیجیتاڵ",category:"Hand Tools",price:19.90,tag:"نوێ",mark:"TAPE"},
  {id:6,brand:"PH.Tools",name:"کاسکی سەلامەتی Pro",category:"Safety",price:16.99,tag:"",mark:"PPE"},
  {id:7,brand:"Ronix",name:"Rotary Hammer ـی 26mm",category:"Power Tools",price:129.00,tag:"پیشەیی",mark:"HAMMER"},
  {id:8,brand:"PH.Tools",name:"دەستکێشی سەلامەتی",category:"Safety",price:12.50,tag:"",mark:"GLOVES"},
  {id:9,brand:"PH.Tools",name:"ئاستی ئەلومینیۆمی",category:"Hand Tools",price:22.00,tag:"",mark:"LEVEL"},
  {id:10,brand:"DeWalt",name:"بازووی بازنەیی 20V",category:"Power Tools",price:179.00,tag:"پیشەیی",mark:"SAW"},
  {id:11,brand:"PH.Tools",name:"کابڵ رێڵی قورس",category:"Site Equipment",price:67.00,tag:"",mark:"REEL"},
  {id:12,brand:"PH.Tools",name:"چرای LED ـی شوێنی کار",category:"Site Equipment",price:39.90,tag:"نوێ",mark:"LIGHT"}
];

let cart = JSON.parse(localStorage.getItem("phToolsCart") || "[]");
let selectedCategory = "All";

const grid = document.getElementById("productGrid");
const empty = document.getElementById("emptyState");
const count = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const backdrop = document.getElementById("cartBackdrop");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const total = document.getElementById("cartTotal");

function money(n){ return "$" + n.toFixed(2); }

function renderProducts(){
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const sort = document.getElementById("sortSelect").value;

  let list = products.filter(p => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const haystack = `${p.brand} ${p.name} ${p.category}`.toLowerCase();
    return matchesCat && haystack.includes(query);
  });

  if(sort === "low") list.sort((a,b)=>a.price-b.price);
  if(sort === "high") list.sort((a,b)=>b.price-a.price);

  grid.innerHTML = list.map(p => `
    <article class="product-card">
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
      <div class="product-image"><span>${p.mark}</span></div>
      <div class="product-info">
        <div class="product-brand">${p.brand} • ${p.category}</div>
        <h3>${p.name}</h3>
        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <button class="add-btn" data-add="${p.id}">زیادکردن</button>
        </div>
      </div>
    </article>
  `).join("");

  empty.style.display = list.length ? "none" : "block";
}

function saveCart(){ localStorage.setItem("phToolsCart", JSON.stringify(cart)); }

function renderCart(){
  const items = cart.map(item => ({...products.find(p=>p.id===item.id), qty:item.qty})).filter(Boolean);

  cartItems.innerHTML = items.map(p => `
    <div class="cart-item">
      <div class="cart-thumb">${p.mark}</div>
      <div>
        <h4>${p.name}</h4>
        <small>${money(p.price)} بۆ یەک دانە</small>
        <div class="qty">
          <button data-minus="${p.id}">−</button>
          <span>${p.qty}</span>
          <button data-plus="${p.id}">+</button>
        </div>
        <button class="remove" data-remove="${p.id}">سڕینەوە</button>
      </div>
      <strong>${money(p.price*p.qty)}</strong>
    </div>
  `).join("");

  cartEmpty.style.display = items.length ? "none" : "block";
  count.textContent = cart.reduce((sum,i)=>sum+i.qty,0);

  total.textContent = money(cart.reduce((sum,i)=>{
    const p=products.find(x=>x.id===i.id);
    return sum+(p?p.price*i.qty:0);
  },0));
}

function addToCart(id){
  const existing = cart.find(i=>i.id===id);
  if(existing) existing.qty++;
  else cart.push({id,qty:1});
  saveCart();
  renderCart();
  openCart();
}

function openCart(){
  cartDrawer.classList.add("open");
  backdrop.classList.add("open");
  document.body.style.overflow="hidden";
}
function closeCart(){
  cartDrawer.classList.remove("open");
  backdrop.classList.remove("open");
  document.body.style.overflow="";
}

document.addEventListener("click", e=>{
  const add=e.target.closest("[data-add]");
  if(add) addToCart(Number(add.dataset.add));

  const plus=e.target.closest("[data-plus]");
  if(plus){
    const i=cart.find(x=>x.id===Number(plus.dataset.plus));
    if(i)i.qty++;
    saveCart();renderCart();
  }

  const minus=e.target.closest("[data-minus]");
  if(minus){
    const i=cart.find(x=>x.id===Number(minus.dataset.minus));
    if(i){
      i.qty--;
      if(i.qty<=0)cart=cart.filter(x=>x.id!==i.id);
    }
    saveCart();renderCart();
  }

  const remove=e.target.closest("[data-remove]");
  if(remove){
    cart=cart.filter(x=>x.id!==Number(remove.dataset.remove));
    saveCart();renderCart();
  }

  const cat=e.target.closest(".category-card");
  if(cat){
    document.querySelectorAll(".category-card").forEach(x=>x.classList.remove("active"));
    cat.classList.add("active");
    selectedCategory=cat.dataset.category;
    renderProducts();
    document.getElementById("shop").scrollIntoView({behavior:"smooth"});
  }
});

document.getElementById("searchToggle").addEventListener("click",()=>{
  const bar=document.getElementById("searchBar");
  bar.classList.toggle("open");
  if(bar.classList.contains("open"))document.getElementById("searchInput").focus();
});

document.getElementById("searchInput").addEventListener("input",renderProducts);
document.getElementById("sortSelect").addEventListener("change",renderProducts);
document.getElementById("cartOpen").addEventListener("click",openCart);
document.getElementById("cartClose").addEventListener("click",closeCart);
backdrop.addEventListener("click",closeCart);

document.getElementById("checkoutBtn").addEventListener("click",()=>{
  if(!cart.length){
    alert("سەبەتەکەت بەتاڵە.");
    return;
  }
  alert("ئەمە وەشانی دیمۆیە. دواتر سیستەمی پارەدان پێوە دەبەسترێت.");
});

renderProducts();
renderCart();
