$(document).ready(function () {

    var table = $('#stockTable').DataTable({
        pageLength: 5,
        lengthMenu: [5, 10, 15, 20, 50, 100, 200, 500],
        columns: [
            {
                data: 'image', render: function (data) {
                    return `<a data-toggle="modal" href='#image-resize-up' class="image-resize-up"><img src="${data}" alt="Product Image" class="img-list-product"></a>`;
                }
            },
            { data: 'id' },
            { data: 'name' },
            { data: 'quantity' },
            { data: 'buyingPrice' },
            { data: 'stockCost' },
            { data: 'price' },
            { data: 'totalPrice' },
            { data: null, defaultContent: '<button type="button" data-toggle="modal" data-target="#productActionModal" class="btn btn-info product-edit-btn">Düzenle</button>' },
        ],
        columnDefs: [
            { title: "", width: '50px', targets: 0 },
            { title: "ID", width: '100px', targets: 1 },
            { title: "İsim", width: '70%', targets: 2 },
            { title: "Alış Fiyatı", targets: 4 },
            { title: "Stok Adet", targets: 3 },
            { title: "Stok Maliyeti", targets: 5 },
            { title: "Fiyat", targets: 6 },
            { title: "Toplam Fiyat", targets: 7 },
            { title: "İşlem", searchable: false, targets: 8 },
        ],
        "language": trTranslation,
        lengthChange: true,
    });


    function loadTableData() {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        if (products && products.length > 0) {
            table.clear().rows.add(products).draw();
            var totalBuy = 0;
            var totalSell = 0;
            products.forEach(element => {
                let buyPrice = parseFloat(element.buyingPrice * element.quantity);
                let sellPrice = parseFloat(element.price * element.quantity);
                totalBuy += buyPrice;
                totalSell += sellPrice;
            });
            $('#estimated-buy').text(totalBuy);
            $('#estimated-sell').text(totalSell);
            $('#estimated-profit').text(totalSell - totalBuy);
            alertify.success('Veriler başarılı bir şekilde çekildi.');
        } else {
            $('#estimated-buy').text(0);
            $('#estimated-sell').text(0);
            $('#estimated-profit').text(0);
        }
    }


    function saveToLocalStorage(data) {
        localStorage.setItem('products', JSON.stringify(data));
        alertify.success('Veriler başarılı bir şekilde kaydedildi.');
    }


    $('#saveProductButton').on('click', function () {
        let name = $('#productName').val();
        let buyingPrice = $('#productBuyingPrice').val();
        let quantity = $('#productQuantity').val();
        let price = $('#productPrice').val();
        let image = $('#productImage')[0].files[0];
        let imageUrl = $('#productImageUrl').val();
        var imgSrc = '';

        if (name && buyingPrice && quantity && price && image) {
            let reader = new FileReader();
            reader.onload = function (e) {
                imgSrc = e.target.result;
                addProduct(name, buyingPrice, quantity, price, imgSrc);
            };

            reader.readAsDataURL(image);

        } else if (name && buyingPrice && quantity && price && imageUrl) {
            imgSrc = imageUrl;
            addProduct(name, buyingPrice, quantity, price, imgSrc);
        } else {
            alert('Lütfen tüm alanları doldurun.');
        }

    });

    function addProduct(name, buyingPrice, quantity, price, image) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        let newProduct = {
            id: 'P' + Math.floor(10000 + Math.random() * 90000),
            name: name,
            buyingPrice: buyingPrice,
            quantity: quantity,
            stockCost: buyingPrice * quantity,
            price: price,
            totalPrice: price * quantity,
            image: image
        }
        products.push(newProduct);
        saveToLocalStorage(products);
        table.row.add(newProduct).draw();
        $('#addProductModal').modal('hide');
        $('#addProductForm')[0].reset();
    }


    $('#stockTable').on('click', '.product-edit-btn', function () {

        var row = $(this).closest('tr');
        var rowData = $('#stockTable').DataTable().row(row).data();

        $('#editProductId').val(rowData.id);
        $('#editProductName').val(rowData.name);
        $('#editProductBuyingPrice').val(rowData.buyingPrice);
        $('#editProductQuantity').val(rowData.quantity);
        $('#editProductPrice').val(rowData.price);
        $('#editProductImage').val(''); // Clear file input
        $('#editProductImage').attr('src', rowData.image);
        $('#editProductImageUrl').val(''); // Clear URL input
    });


    $('#updateProductButton').on('click', function () {
        var id = $('#editProductId').val();
        var name = $('#editProductName').val();
        var buyingPrice = $('#editProductBuyingPrice').val();
        var quantity = $('#editProductQuantity').val();
        var price = $('#editProductPrice').val();
        var image = $('#editProductImage')[0].files[0];
        var imageUrl = $('#editProductImageUrl').val();
        var imgSrc = $('#editProductImage').attr('src'); // Use current image if no new image is selected


        if (image) {
            var reader = new FileReader();
            reader.onload = function (e) {
                imgSrc = e.target.result;
                updateProductData(id, name, buyingPrice, quantity, price, imgSrc);
            };
            reader.readAsDataURL(image);
        } else if (imageUrl) {
            imgSrc = imageUrl;
            updateProductData(id, name, buyingPrice, quantity, price, imgSrc);
        } else {
            updateProductData(id, name, buyingPrice, quantity, price, imgSrc);
        }
    });


    function updateProductData(id, name, buyingPrice, quantity, price, image) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        let index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = {
                id: id,
                name: name,
                buyingPrice: buyingPrice,
                quantity: quantity,
                stockCost: buyingPrice * quantity,
                price: price,
                totalPrice: price * quantity,
                image: image
            };
            saveToLocalStorage(products);
            table.clear().rows.add(products).draw();
            $('#productActionModal').modal('hide');
        }
    }




    $('#deleteProductButton').on('click', function () {
        var id = $('#editProductId').val();
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(p => p.id !== id);
        saveToLocalStorage(products);
        table.clear().rows.add(products).draw();
        $('#productActionModal').modal('hide');
        alertify.success('Veriler başarılı bir şekilde silindi.');
    });


    $('#stockTable').on('click', '.image-resize-up', function () {
        var row = $(this).closest('tr');
        var rowData = $('#stockTable').DataTable().row(row).data();

        $('#imageResizeProductName').text(rowData.name);
        $('#imageResizeProductImage').attr('src', rowData.image);

    })


    loadTableData();

});
