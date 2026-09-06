const products = [
  {id:1,brand:"DEWALT",name:"ئیمپەکتی شارژی 20V XR",category:"ئامرازی کارەبا",price:185000,old:210000,image:"assets/dewalt-impact.jpg",badge:"داشکاندن"},
  {id:2,brand:"VELLOO",name:"دریلی کارەبایی پیشەیی",category:"ئامرازی کارەبا",price:99000,old:null,image:"assets/velloo-drill.jpg",badge:"نوێ"},
  {id:3,brand:"Ronix",name:"ئیمپەکتی شارژی 20V",category:"ئامرازی کارەبا",price:145000,old:160000,image:"assets/ronix-impact.jpg",badge:"پڕفرۆش"},
  {id:4,brand:"Milwaukee",name:"دریلی Brushless",category:"ئامرازی کارەبا",price:225000,old:null,image:"assets/milwaukee-drill.jpg",badge:"پیشەیی"},
  {id:5,brand:"KNAUF",name:"سێت 3 دانە ترویل",category:"ئامرازی دەستی",price:35000,old:null,image:"assets/knauf-trowels.jpg",badge:"نوێ"},
  {id:6,brand:"P.H.Tools",name:"سێتی ئامرازی دەستی",category:"ئامرازی دەستی",price:65000,old:75000,image:"assets/knauf-trowels.jpg",badge:"داشکاندن"},
  {id:7,brand:"P.H.Tools",name:"سێتی پاراستنی کارگە",category:"پاراستن",price:42000,old:null,image:"assets/hero-banner.jpg",badge:"پێشنیار"},
  {id:8,brand:"P.H.Tools",name:"کۆمەڵە ئامرازی پیشەسازی",category:"کەرەستەی پیشەسازی",price:120000,old:null,image:"assets/hero-banner.jpg",badge:"نوێ"}
];

let cart = JSON.parse(localStorage.getItem("ph-tools-cart") || "[]");
let activeCategory = "هەموو";
let searchTerm = "";
let sortMode = "featured";

const grid = document.getElementById("productGrid");
const empty = document.getElementById("emptyState");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotal = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");

function money(n){ return new Intl.NumberFormat("ku-IQ").format(n) + " د.ع"; }

function saveCart(){
  localStorage.setItem("ph-tools-cart", JSON.stringify(cart));
  renderCart();
}

function renderProducts(){
  let list = products.filter(p => {
    const categoryOk = activeCategory === "هەموو" || p.category === activeCategory;
    const query = (p.name + " " + p.brand + " " + p.category).toLowerCase();
    return categoryOk && query.includes(searchTerm.toLowerCase());
  });
  if(sortMode === "low") list.sort((a,b)=>a.price-b.price);
  if(sortMode === "high") list.sort((a,b)=>b.price-a.price);

  grid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="badge">${p.badge}</span>
      </div>
      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <div class="product-title">${p.name}</div>
        <div class="product-meta">${p.category}</div>
        <div class="product-bottom">
          <div>
            <div class="price">${money(p.price)}</div>
            ${p.old ? `<small style="color:#999;text-decoration:line-through">${money(p.old)}</small>` : ""}
          </div>
          <button class="add-btn" data-add="${p.id}">زیادکردن +</button>
        </div>
      </div>
    </article>
  `).join("");
  empty.hidden = list.length !== 0;
}

function renderCart(){
  const totalQty = cart.reduce((s,i)=>s+i.qty,0);
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  cartCount.textContent = totalQty;
  cartTotal.textContent = money(total);
  cartEmpty.style.display = cart.length ? "none" : "block";
  cartItems.style.display = cart.length ? "grid" : "none";
  cartItems.innerHTML = cart.map(i => `
    <div class="cart-item">
      <img src="${i.image}" alt="${i.name}">
      <div>
        <h4>${i.name}</h4>
        <small>${money(i.price)}</small>
        <div class="qty">
          <button data-qty="${i.id}" data-change="-1">−</button>
          <b>${i.qty}</b>
          <button data-qty="${i.id}" data-change="1">+</button>
          <button class="remove" data-remove="${i.id}">سڕینەوە</button>
        </div>
      </div>
      <strong>${money(i.price*i.qty)}</strong>
    </div>
  `).join("");
}

function showToast(text){
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2200);
}

function addToCart(id){
  const p = products.find(x=>x.id===id);
  const existing = cart.find(x=>x.id===id);
  if(existing) existing.qty++;
  else cart.push({...p,qty:1});
  saveCart();
  showToast("بەرهەمەکە خرایە ناو سەبەتە.");
}

grid.addEventListener("click", e=>{
  const btn=e.target.closest("[data-add]");
  if(btn) addToCart(Number(btn.dataset.add));
});

cartItems.addEventListener("click", e=>{
  const qty=e.target.closest("[data-qty]");
  const remove=e.target.closest("[data-remove]");
  if(qty){
    const item=cart.find(x=>x.id===Number(qty.dataset.qty));
    item.qty += Number(qty.dataset.change);
    if(item.qty<=0) cart=cart.filter(x=>x.id!==item.id);
    saveCart();
  }
  if(remove){
    cart=cart.filter(x=>x.id!==Number(remove.dataset.remove));
    saveCart();
  }
});

function openCart(){cartDrawer.classList.add("open");overlay.classList.add("open")}
function closeCart(){cartDrawer.classList.remove("open");overlay.classList.remove("open")}
document.getElementById("cartBtn").onclick=openCart;
document.getElementById("closeCart").onclick=closeCart;
overlay.onclick=()=>{closeCart(); closeModal();};

document.getElementById("searchBtn").onclick=()=>{
  document.getElementById("searchPanel").classList.toggle("open");
  document.getElementById("searchInput").focus();
};
document.getElementById("searchInput").addEventListener("input",e=>{
  searchTerm=e.target.value.trim();
  renderProducts();
});
document.getElementById("clearSearch").onclick=()=>{
  document.getElementById("searchInput").value="";
  searchTerm="";
  renderProducts();
};
document.getElementById("sortSelect").onchange=e=>{
  sortMode=e.target.value;
  renderProducts();
};

document.querySelectorAll(".category-card").forEach(btn=>{
  btn.addEventListener("click",()=>{
    activeCategory=btn.dataset.category;
    document.getElementById("products").scrollIntoView({behavior:"smooth"});
    renderProducts();
    showToast(`پۆلی «${activeCategory}» هەڵبژێردرا.`);
  });
});

document.getElementById("mobileMenuBtn").onclick=()=>{
  document.getElementById("mainNav").classList.toggle("open");
};
document.querySelectorAll(".nav a").forEach(a=>a.onclick=()=>document.getElementById("mainNav").classList.remove("open"));

const modal=document.getElementById("checkoutModal");
function openModal(){
  if(!cart.length){showToast("سەرەتا بەرهەمێک بۆ سەبەتە زیاد بکە.");return}
  modal.classList.add("open");overlay.classList.add("open");
}
function closeModal(){modal.classList.remove("open")}
document.getElementById("checkoutBtn").onclick=openModal;
document.getElementById("closeModal").onclick=closeModal;

document.getElementById("checkoutForm").onsubmit=e=>{
  e.preventDefault();
  const data=new FormData(e.target);
  const orderNo="PH-"+Math.floor(10000+Math.random()*90000);
  cart=[];
  saveCart();
  closeModal();closeCart();
  e.target.reset();
  showToast(`داواکاری ${orderNo} وەرگیرا — سوپاس!`);
};

renderProducts();
renderCart();
