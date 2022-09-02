"use strict";
// lazy load for images

const productsTable = document.querySelector('.products__table');
const lazyImages    = productsTable.querySelectorAll('.product__image._lazy > img[data-src]');
const docHeight     = document.documentElement.clientHeight;

let lazyImagesPositions = [];

if (lazyImages.length){
   lazyImages.forEach( img => {
      if (img.dataset.src){
         lazyImagesPositions.push(img.getBoundingClientRect().top + scrollY);
         lazyScrollCheck();
      }
   })
}

window.addEventListener('scroll', lazyScroll);

function lazyScroll(){
   if (productsTable.querySelectorAll('.product__image._lazy > img[data-src]').length){
      lazyScrollCheck();
   } else {
      window.removeEventListener('scroll', lazyScroll)
   }
}

function lazyScrollCheck(){
   let index = lazyImagesPositions.findIndex( item => scrollY > item - docHeight);

   if (index >= 0){
      if (lazyImages[index].dataset.src){
         lazyImages[index].src = lazyImages[index].dataset.src;
         lazyImages[index].removeAttribute('data-src');
         delete lazyImagesPositions[index];
      }
   }
}

// tabs & filter for products

const productNavigationTabs = document.querySelector('.products__navigation');
const productTabs           = document.querySelectorAll('.products__navigation-btn');
const products              = document.querySelectorAll('.product');

if (productNavigationTabs && productTabs){

   productTabs.forEach((e) => {

      e.addEventListener('click', function(){

         for (let tab of productTabs){
            tab.classList.remove('_active');
         }

         e.classList.add('_active');

         for (let product of products){
            product.classList.remove('_active')

            if (product.dataset.category === e.dataset.category){
               product.classList.add('_active');
            }

         }
      })
   })

   productTabs[0].addEventListener('click', function (){

      for (let product of products){
         product.classList.add('_active')
      }
      
   })

}

// change price (size attr)

document.addEventListener('click', function (e){
   if (e.target.classList.contains('product__size')){

      let t            = e.target;
      let closestPrice = t.parentNode.parentNode.querySelector('.price .price-number');
      let sizeAttrs    = t.parentNode.children;
      
      for (let attr of sizeAttrs){
         attr.classList.remove('_active');
      }

      t.classList.add('_active');

      closestPrice.innerText = t.dataset.price;
   }
});

// card & creating order object
const orderBtns  = document.querySelectorAll('.product__buy');
const orderTable = document.querySelector('.order-table');

let order = {
   totalPrice: 0,
   counter: 0,
   positions: 0,
};

// functions helpers - start
function positions(){
   return order.positions = Object.keys(order).length - 3;
}

function counter(){
   let amount = 0;
   
   for (let i of Object.values(order)){
      if (typeof i === 'object'){
         amount += i.counter;
      }
   }

   return order.counter = amount;
}

function totalPrice(){
   let sum = 0;
   
   for (let i of Object.values(order)){
      if (typeof i === 'object'){
         sum += i.totalPrice;
      }
   }

   return order.totalPrice = sum;

}

const makeOrder = document.querySelector('.pop-up__body-makeorder');
function makeOrderDisabled(){
   if ((Object.keys(order).length - 3) === 0){
      makeOrder.disabled = true;
   } else {
      makeOrder.disabled = false;
   }
}

const totalPriceElement = document.querySelector('.totalPrice__scoreboard');
function changeValueTotalPriceElement(){
   totalPriceElement.innerHTML = order['totalPrice']
}

function localStorageOrder(){
   // save order object in local storage
   localStorage.setItem('order', JSON.stringify(order));
}

function localStorageCart(){
   // save cart element inner html
   localStorage.setItem('cartInner', orderTable.innerHTML);

}

//function for launch helpers
function additionalFunctions(){
   positions();
   counter();
   totalPrice();
   makeOrderDisabled();
   changeValueTotalPriceElement();
   localStorageOrder();
   localStorageCart();
}
// functions helpers - end


// create class for order item creation
class OrderItem{
   constructor(size, price){
   this.size = size;
   this.price = price;
   this.counter = 1;

   this.totalPrice = this.price * this.counter;
   }
}


//hang up event listener on all buy buttons in catalog
const cartBoxCounter            = document.querySelector('.cart__box-counter');
const orderTableEmtyHTML = `<p class="pop-up__body-table-empty">Cart is empty</p>`;

function checkingOrderEmptyness(){
   if (Object.keys(order).length > 0 && orderTableEmpty){
      orderTableEmpty.remove();
   } else {
      orderTable.innerHTML = orderTableEmtyHTML;
   }
}

orderBtns.forEach((elem) => {

   elem.addEventListener('click', (e) => {
      // get important options&values
      let t            = e.target;
      let parent       = t.closest('.product');
      let activeSize   = parent.querySelector('.product__size._active').dataset.size;
      let activePrice  = parent.querySelector('.product__size._active').dataset.price;
      let itemName     = parent.querySelector('.product__title').innerText + ' ' + activeSize;
      let itemImage    = parent.querySelector('.product__image > img').src;
      let itemImageAlt = parent.querySelector('.product__image > img').alt;

      // create object for order item
      let orderItem = new OrderItem(activeSize, activePrice);

      if (Object.keys(order).includes(itemName)){
         order[itemName].counter++;
         order[itemName].totalPrice = order[itemName].price * order[itemName].counter;
      } else {
         order[itemName] = orderItem;
      }

      // create html parts for order items and show them
      let currentItem = `<article class="order-table__item" data-name="${itemName}" data-pricebyone="${activePrice}">             
                           <header class="order-table__item-header">
                              <h3 class="order-table__item-title product__title">${itemName}</h3>
                           </header>
                           <button class="order-table__item-delete" onclick="deleteElement(this)" title="delete item from cart" type="button">
                              <svg width="72px" height="72px" viewBox="0 0 72 72" id="emoji" xmlns="http://www.w3.org/2000/svg"style="enable-background:new 0 0 60 60;">
                                 <g id="line">
                                 <line x1="17.5" x2="54.5" y1="17.5" y2="54.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/>
                                 <line x1="54.5" x2="17.5" y1="17.5" y2="54.5"  stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/>
                                 </g>
                              </svg>
                           </button>
                           <figure class="order-table__item-image _ibg">
                              <img src="${itemImage}" alt="${itemImageAlt}">
                           </figure>
                           <div class="order-table__item-aside">
                              <div class="order-table__item-counter item-counter">
                                 <button class="item-counter__btn item-counter__minus" data-action="-" onclick="changeCartItemCounter(this)" type="button"><span>-</span></button>
                                 <p class="item-counter__scoreboard">${order[itemName]['counter']}</p>
                                 <button class="item-counter__btn item-counter__plus" data-action="+" onclick="changeCartItemCounter(this)" type="button">+</button>
                              </div>
                              <p class="order-table__item-price item-price">
                                 <span class="item-price__scoreboard">${order[itemName]['totalPrice']}</span> 
                              ₴
                              </p>
                           </div>
                        </article>`;
      
      let checkOrderTableOnExistingElement = orderTable.querySelector(`.order-table__item[data-name="${itemName}"]`);

      if (checkOrderTableOnExistingElement){
        checkOrderTableOnExistingElement.querySelector('.item-counter__scoreboard').innerHTML = order[itemName]['counter'];
        checkOrderTableOnExistingElement.querySelector('.item-price__scoreboard').innerText   = order[itemName]['totalPrice'];
      } else {
         orderTable.innerHTML += currentItem;
      }

      const checkOrderTableOnItems = orderTable.querySelectorAll(`.order-table__item`);
      const orderTableEmpty        = orderTable.querySelector('.pop-up__body-table-empty');

      //checking our cart on emptiness and remove text about empty cart if cart isn't empty
      if (checkOrderTableOnItems && orderTableEmpty) {
         orderTableEmpty.remove();
      }

      additionalFunctions();
      // set/update value for cart button counter
      cartBoxCounter.innerHTML = order.counter;

      console.log(order);
   })
})

// hang up event listener on delete buttons for our cart items

function deleteElement(e){
   let closestItem = e.closest('.order-table__item');
   closestItem.remove();
   delete order[closestItem.dataset.name];
   
   // checking our cart on emptiness and add text about empty cart if cart is empty
   if(orderTable.querySelectorAll(`.order-table__item`).length === 0){
      orderTable.innerHTML = orderTableEmtyHTML;
   };
   
   additionalFunctions();
   // update value for cart button counter
   cartBoxCounter.innerHTML = order.counter;

   console.log(order);
}
         
// create mechanism for cart items counters & total product price

function changeCartItemCounter(e){
   let t                          = e;
   let counterButtonAction        = t.dataset.action;
   let closestCounterScoreboard   = t.closest('.item-counter').querySelector('.item-counter__scoreboard');
   let closestItem                = t.closest('.order-table__item');
   let closestItemDataName        = closestItem.dataset.name;
   let closestItemPriceScoreboard = closestItem.querySelector('.item-price__scoreboard');
   let closestItemPriceByOne      = closestItem.dataset.pricebyone;

   if (counterButtonAction === '+'){
      closestCounterScoreboard.innerHTML++;
      order[closestItemDataName]['counter']++;
   } else if (closestCounterScoreboard.innerHTML > 1) {
      closestCounterScoreboard.innerHTML--;
      order[closestItemDataName]['counter']--;
   }

   order[closestItemDataName]['totalPrice'] = order[closestItemDataName]['counter'] * closestItemPriceByOne;
   closestItemPriceScoreboard.innerHTML     = order[closestItemDataName]['totalPrice'];

   additionalFunctions();
   cartBoxCounter.innerHTML = order.counter;

   console.log(order);
}

// button cart & pop-up mechanism
const cartPopUp = document.querySelector('.pop-up');
const cartBtn   = document.querySelector('.cart');
const cartClose = document.querySelector('.pop-up__close');

cartBtn.addEventListener('click', () => {
   cartPopUp.classList.add('_active');
   document.body.classList.add('_lock');
});

cartClose.addEventListener('click', () => {
   cartPopUp.classList.remove('_active');
   document.body.classList.remove('_lock');
});

document.addEventListener('click', (e) => {
   if (e.target.classList.contains('pop-up')){
      cartPopUp.classList.remove('_active');
      document.body.classList.remove('_lock');
   }
});

// take data from local storege for order object and elements for cart

let orderFromLocalStorage = localStorage.getItem('order');
if (orderFromLocalStorage) order = JSON.parse(orderFromLocalStorage);
cartBoxCounter.innerHTML = order.counter;
if (Object.keys(order).length - 3 > 0){
   orderTable.innerHTML = localStorage.getItem('cartInner');
}
   
changeValueTotalPriceElement();
makeOrderDisabled();
   
console.log(order);

// cahnge arrow position
const arrow  = document.querySelector('.arrow');
const select = document.querySelector('.arrow > select');

arrow.addEventListener('click', (e) => {
   arrow.classList.toggle('up');
})

document.addEventListener('click', (e) => {
   if (arrow.classList.contains('up') && e.target !== select){
      arrow.classList.remove('up');
   }
})