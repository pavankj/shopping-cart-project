const API = (() => {
  const URL = "http://localhost:3000";
  
  const getCart = () => {
    return fetch(`${URL}/cart`).then(res => res.json());
  };

  const getInventory = () => {
    return fetch(`${URL}/inventory`).then(res => res.json());
  };

  const addToCart = (inventoryItem) => {
    return fetch(`${URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inventoryItem),
    }).then(res => res.json());
  };

  const updateCart = (id, newAmount) => {
    return fetch(`${URL}/cart/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: newAmount }),
    }).then(res => res.json());
  };

  const deleteFromCart = (id) => {
    return fetch(`${URL}/cart/${id}`, {
      method: "DELETE",
    }).then(res => res.json());
  };

  const checkout = () => {
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const Model = (() => {
  class State {
    #onChange;
    #inventory;
    #cart;
    constructor() {
      this.#inventory = [];
      this.#cart = [];
      this.#onChange = () => {};
    }
    
    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    set cart(newCart) {
      this.#cart = newCart;
      this.#onChange();
    }
    
    set inventory(newInventory) {
      this.#inventory = newInventory;
      this.#onChange();
    }

    subscribe(cb) {
      this.#onChange = cb;
    }
  }

  return {
    State,
    ...API,
  };
})();

const View = (() => {
  const renderInventory = (inventory, handleAddToCart) => {
    const inventoryList = document.querySelector('.inventory__list');
    const amounts = {};
    
    // Store current amounts before re-render
    inventoryList.querySelectorAll('.inventory-item').forEach(item => {
      const id = item.querySelector('.add-to-cart-btn').dataset.id;
      const amount = item.querySelector('.amount').textContent;
      amounts[id] = amount;
    });

    // Clear the list
    inventoryList.innerHTML = '';

    inventory.forEach(item => {
      const li = document.createElement('li');
      li.className = 'inventory-item';

      const itemName = document.createElement('span');
      itemName.className = 'item-name';
      itemName.textContent = item.content;

      const decreaseBtn = document.createElement('button');
      decreaseBtn.className = 'decrease-btn';
      decreaseBtn.textContent = '-';

      const amountSpan = document.createElement('span');
      amountSpan.className = 'amount';
      amountSpan.textContent = amounts[item.id] || '0';

      const increaseBtn = document.createElement('button');
      increaseBtn.className = 'increase-btn';
      increaseBtn.textContent = '+';

      const addToCartBtn = document.createElement('button');
      addToCartBtn.className = 'add-to-cart-btn';
      addToCartBtn.textContent = 'add to cart';
      addToCartBtn.dataset.id = item.id;

      li.appendChild(itemName);
      li.appendChild(decreaseBtn);
      li.appendChild(amountSpan);
      li.appendChild(increaseBtn);
      li.appendChild(addToCartBtn);

      // Add event listeners
      decreaseBtn.addEventListener('click', () => {
        let amount = parseInt(amountSpan.textContent);
        if (amount > 0) {
          amountSpan.textContent = amount - 1;
        }
      });

      increaseBtn.addEventListener('click', () => {
        let amount = parseInt(amountSpan.textContent);
        amountSpan.textContent = amount + 1;
      });

      addToCartBtn.addEventListener('click', () => {
        const amount = parseInt(amountSpan.textContent);
        if (amount > 0) {
          handleAddToCart(parseInt(item.id), amount);
          amountSpan.textContent = '0';
        }
      });

      inventoryList.appendChild(li);
    });
  };

  const renderCart = (cart, handleDelete, handleEdit, handleEditSubmit) => {
    const cartList = document.querySelector('.cart__list');
    cartList.innerHTML = '';

    cart.forEach(item => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.dataset.id = item.id;
      if (item.editing) {
        li.dataset.editing = 'true';
      }

      if (item.editing) {
        const itemName = document.createElement('span');
        itemName.className = 'item-name';
        itemName.textContent = item.content;

        const decreaseBtn = document.createElement('button');
        decreaseBtn.className = 'decrease-btn';
        decreaseBtn.textContent = '-';

        const amountSpan = document.createElement('span');
        amountSpan.className = 'amount';
        amountSpan.textContent = item.amount;

        const increaseBtn = document.createElement('button');
        increaseBtn.className = 'increase-btn';
        increaseBtn.textContent = '+';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.textContent = 'save';

        li.appendChild(itemName);
        li.appendChild(decreaseBtn);
        li.appendChild(amountSpan);
        li.appendChild(increaseBtn);
        li.appendChild(saveBtn);

        // Add event listeners for edit mode
        decreaseBtn.addEventListener('click', () => {
          let amount = parseInt(amountSpan.textContent);
          if (amount > 1) {
            amountSpan.textContent = amount - 1;
          }
        });

        increaseBtn.addEventListener('click', () => {
          let amount = parseInt(amountSpan.textContent);
          amountSpan.textContent = amount + 1;
        });

        saveBtn.addEventListener('click', () => {
          const newAmount = parseInt(amountSpan.textContent);
          handleEditSubmit(item.id, newAmount);
        });
      } else {
        const itemName = document.createElement('span');
        itemName.className = 'item-name';
        itemName.textContent = `${item.content} x ${item.amount}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'delete';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'edit';

        li.appendChild(itemName);
        li.appendChild(deleteBtn);
        li.appendChild(editBtn);

        // Add event listeners
        deleteBtn.addEventListener('click', () => handleDelete(item.id));
        editBtn.addEventListener('click', () => handleEdit(item.id));
      }

      cartList.appendChild(li);
    });
  };

  return {
    renderInventory,
    renderCart,
  };
})();
const Controller = ((model, view) => {
  const state = new model.State();

  const handleAddToCart = (itemId, amount) => {
    const item = state.inventory.find((item) => item.id === itemId);
    const existingCartItem = state.cart.find((cartItem) => cartItem.id === itemId);

    if (existingCartItem) {
      model.updateCart(itemId, existingCartItem.amount + amount)
        .then(updatedItem => {
          state.cart = state.cart.map((item) =>
            item.id === itemId ? { ...updatedItem, editing: false } : item
          );
        })
        .catch(error => console.error('Error updating cart:', error));
    } else {
      model.addToCart({
        id: item.id,
        content: item.content,
        amount: amount,
      })
        .then(newCartItem => {
          state.cart = [...state.cart, { ...newCartItem, editing: false }];
        })
        .catch(error => console.error('Error adding to cart:', error));
    }
  };

  const handleEdit = (itemId) => {
    state.cart = state.cart.map((item) =>
      item.id === itemId ? { ...item, editing: true } : item
    );
  };

  const handleEditSubmit = (itemId, newAmount) => {
    model.updateCart(itemId, newAmount)
      .then(updatedItem => {
        state.cart = state.cart.map((item) =>
          item.id === itemId ? { ...updatedItem, editing: false } : item
        );
      })
      .catch(error => console.error('Error updating cart:', error));
  };

  const handleDelete = (itemId) => {
    model.deleteFromCart(itemId)
      .then(() => {
        state.cart = state.cart.filter((item) => item.id !== itemId);
      })
      .catch(error => console.error('Error deleting from cart:', error));
  };

  const handleCheckout = () => {
    model.checkout()
      .then(() => {
        state.cart = [];
        alert("Checkout");
      })
      .catch(error => console.error('Error during checkout:', error));
  };

  const init = () => {
    Promise.all([model.getInventory(), model.getCart()])
      .then(([inventory, cart]) => {
        state.inventory = inventory;
        state.cart = cart;
      })
      .catch(error => console.error('Error initializing:', error));

    state.subscribe(() => {
      view.renderInventory(state.inventory, handleAddToCart);
      view.renderCart(state.cart, handleDelete, handleEdit, handleEditSubmit);
    });

    const checkoutBtn = document.querySelector(".checkout-btn");
    checkoutBtn.addEventListener("click", handleCheckout);
  };

  return {
    init,
  };
})(Model, View);

Controller.init();