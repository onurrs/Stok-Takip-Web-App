$(document).ready(function () {
    moment.locale('tr');

    $('.classicSelect').select2({
        allowClear: false,
        theme: "classic"
    });

    var calendarEl = document.getElementById('calendar');
    var saleDateInput = $('#date');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        dateClick: function (info) {
            saleDateInput.val(info.dateStr);
        },
        height: "auto",
        contentHeight: "auto",
        locale: 'tr',
        buttonText: {
            today: 'bugün',
            month: 'ay',
            week: 'hafta',
            day: 'gün',
            list: 'liste'
        }
    });

    var table = $('#saleTable').DataTable({
        pageLength: 5,
        lengthMenu: [5, 10, 15, 20, 50, 100, 200, 500],
        columns: [
            { data: 'id' },
            { data: 'pid' },
            { data: 'pname' },
            { data: 'pprice' },
            { data: 'uid' },
            { data: 'uname' },
            { data: 'quantity' },
            { data: 'total' },
            { data: 'date' },
            { data: null, defaultContent: '<button type="button" data-toggle="modal" data-target="#saleActionModal" class="btn btn-info sale-edit-btn" style="margin-left: 5px; margin-right: 5px">Düzenle</button>' }
        ],
        columnDefs: [
            { title: "ID", targets: 0 },
            { title: "Ürün ID", targets: 1 },
            { title: "Ürün İsmi", targets: 2 },
            { title: "Ürün Fiyatı", targets: 3 },
            { title: "Müşteri ID", targets: 4 },
            { title: "Müşteri İsmi", targets: 5 },
            { title: "Adet", targets: 6 },
            { title: "Toplam Tutar", targets: 7 },
            { title: "Satış Tarihi", targets: 8 },
            { title: "İşlem", width: '250px', searchable: false, targets: 9 },
        ],
        "language": trTranslation,
        lengthChange: true,
    });

    function loadTableData() {
        let sales = JSON.parse(localStorage.getItem('sales')) || [];
        
        if (sales && sales.length > 0) {
            table.clear().rows.add(sales).draw();
            alertify.success('Veriler başarılı bir şekilde çekildi.');
        }
    }


    function saveToLocalStorage(data) {
        localStorage.setItem('sales', JSON.stringify(data));
        alertify.success('Veriler başarılı bir şekilde kaydedildi.');
    }

    //Modal Page View
    $('#addSaleButton').on('click', function () {

        setTimeout(function() {
            calendar.render();
          }, 200);
          

        let products = JSON.parse(localStorage.getItem('products'));
        let customers = JSON.parse(localStorage.getItem('customers'));
        

        // Check if products data exists
        if (products) {
            $('#pidSelect').empty();
            $('#pnameSelect').empty();
            // Populate the select elements
            products.forEach(product => {
                $('#pidSelect').append(new Option(product.id, product.id));
                $('#pnameSelect').append(new Option(product.name, product.name));
            });

            let initialSelectedId = $('#pidSelect').val();
            let initialSelectedProduct = products.find(product => product.id === initialSelectedId);

            if (initialSelectedProduct) {
                $('#pprice').val(initialSelectedProduct.price);
            }

            // Flag to prevent event loop
            let suppressChangeProduct = false;

            // Event listener for pidSelect
            $('#pidSelect').on('change', function () {
                if (suppressChangeProduct) return; // Exit if we're already updating

                suppressChangeProduct = true;
                let selectedId = $(this).val();
                let selectedProduct = products.find(product => product.id === selectedId);

                if (selectedProduct) {
                    $('#pnameSelect').val(selectedProduct.name).trigger('change');
                    $('#pprice').val(selectedProduct.price);
                }
                suppressChangeProduct = false;
            });

            // Event listener for pnameSelect
            $('#pnameSelect').on('change', function () {
                if (suppressChangeProduct) return; // Exit if we're already updating

                suppressChangeProduct = true;
                let selectedName = $(this).val();
                let selectedProduct = products.find(product => product.name === selectedName);

                if (selectedProduct) {
                    $('#pidSelect').val(selectedProduct.id).trigger('change');
                    $('#pprice').val(selectedProduct.price);
                }
                suppressChangeProduct = false;
            });
        }

        if (customers) {
            $('#uidSelect').empty();
            $('#unameSelect').empty();

            customers.forEach(customer => {
                $('#uidSelect').append(new Option(customer.id, customer.id));
                $('#unameSelect').append(new Option(customer.name + " " + customer.lastname, customer.name + " " + customer.lastname));
            });

            let suppressChangeCustomer = false;
            // Event listener for uidSelect
            $('#uidSelect').on('change', function () {

                if (suppressChangeCustomer) return; // Exit if we're already updating

                suppressChangeCustomer = true;
                let selectedId = $(this).val();
                let selectedCustomer = customers.find(customer => customer.id === selectedId);

                if (selectedCustomer) {
                    $('#unameSelect').val(selectedCustomer.name + " " + selectedCustomer.lastname).trigger('change');
                }
                suppressChangeCustomer = false;
            });

            // Event listener for unameSelect
            $('#unameSelect').on('change', function () {
                if (suppressChangeCustomer) return; // Exit if we're already updating

                suppressChangeCustomer = true;
                let selectedName = $(this).val();
                let [firstName, lastName] = selectedName.split(' ');

                let selectedCustomer = customers.find(customer =>
                    customer.name === firstName && customer.lastname === lastName
                );

                if (selectedCustomer) {
                    $('#uidSelect').val(selectedCustomer.id).trigger('change');
                }
                suppressChangeCustomer = false;
            });
        }

        $('#quantity').on('input', function () {
            $('#total').val($(this).val() * $('#pprice').val());
        })
    });


    //Add Sale
    $('#saveSaleButton').on('click', function () {
        let pid = $('#pidSelect').val();
        let pname = $('#pnameSelect').val();
        let pprice = $('#pprice').val();
        let uid = $('#uidSelect').val();
        let uname = $('#unameSelect').val();
        let quantity = $('#quantity').val();
        let total = $('#total').val();
        let date = $('#date').val();

        let products = JSON.parse(localStorage.getItem('products'));
        let customers = JSON.parse(localStorage.getItem('customers'));

        let product = products.find(products => products.id === pid);
        let customer = customers.find(customer => customer.id === uid);


        if (pid && pname && pprice && uid && uname && quantity && total && date) {
            if (+customer.balance < +total) {
                alertify.error("Müşterinin bakiyesi yetersiz!");
                return;
            }
            if (+product.quantity < +quantity) {
                alertify.error("Stokta yeteri kadar " + pname + " yok!");
                return;
            }

            let sales = JSON.parse(localStorage.getItem('sales')) || [];

            let newSale = {
                id: 'S' + Math.floor(10000 + Math.random() * 90000),
                pid: pid,
                pname: pname,
                pprice: pprice,
                uid: uid,
                uname: uname,
                quantity: quantity,
                total: total,
                date: date
            };
            sales.push(newSale);
            table.row.add(newSale).draw();
            saveToLocalStorage(sales);

            product.quantity = +product.quantity - +quantity;
            product.stockCost = product.buyingPrice * +product.quantity;
            product.totalPrice = product.price * +product.quantity;
            localStorage.setItem('products', JSON.stringify(products));

            customer.balance = +customer.balance - +total;
            localStorage.setItem('customers', JSON.stringify(customers));

            $('#addSaleModal').modal('hide');
            $('#addSaleForm')[0].reset();
            updateChart();
        } else {
            alertify.error("Bütün Alanları Doldurun!");
        }

    });

    $('#dateFormatSelector').on('change', function () {
        let sales = JSON.parse(localStorage.getItem('sales')) || [];


        for (let index = 0; index < sales.length; index++) {
            sales[index].date = convertDateFormat(sales[index].date, $(this).val())

            saveToLocalStorage(sales);
            table.clear().rows.add(sales).draw();
        }
    })

    function convertDateFormat(inputDate, outputFormat) {
        // List of potential input formats
        var inputFormats = [
            moment.ISO_8601,
            'DD-MM-YYYY',
            'DD/MM/YYYY',
            'MMMM Do YYYY',
            'MMMM D, YYYY',
            'MMM Do YYYY',
            'MMM D, YYYY',
            'D MMMM YYYY',
            'D MMM YYYY',
            'Do MMMM YYYY',
            'dddd, D MMMM YYYY',
            'D MMMM YYYY, h:mm:ss a',
            'dddd, MMMM D YYYY',
            'ddd, D MMM YYYY',
            'LL',
            'LLL',
            'LLLL',
        ];

        // Attempt to parse the input date using the potential formats
        var parsedDate = moment(inputDate, inputFormats, true);

        // Check if the parsed date is valid
        if (parsedDate.isValid()) {
            return parsedDate.format(outputFormat);
        }

        // Format the parsed date to the desired output format

    }

    $('#saleTable').on('click', '.sale-edit-btn', function () {

        var row = $(this).closest('tr');
        var rowData = $('#saleTable').DataTable().row(row).data();

        let products = JSON.parse(localStorage.getItem('products'));
        let customers = JSON.parse(localStorage.getItem('customers'));

        if (products) {
            $('#editpidSelect').empty();
            $('#editpnameSelect').empty();
            // Populate the select elements
            $('#editpidSelect').prepend(new Option(rowData.pid, rowData.pid));
            $('#editpnameSelect').prepend(new Option(rowData.pname, rowData.pname));

            products.forEach(product => {
                if (product.id !== rowData.pid) {
                    $('#editpidSelect').append(new Option(product.id, product.id));
                    $('#editpnameSelect').append(new Option(product.name, product.name));
                }
            });

            // Flag to prevent event loop
            let suppressChangeProduct = false;

            // Event listener for pidSelect
            $('#editpidSelect').on('change', function () {
                if (suppressChangeProduct) return; // Exit if we're already updating

                suppressChangeProduct = true;
                let selectedId = $(this).val();
                let selectedProduct = products.find(product => product.id === selectedId);

                if (selectedProduct) {
                    $('#editpnameSelect').val(selectedProduct.name).trigger('change');
                    $('#editpprice').val(selectedProduct.price);
                    $('#edittotal').val($('#editquantity').val() * $('#editpprice').val());
                }
                suppressChangeProduct = false;
            });

            // Event listener for pnameSelect
            $('#editpnameSelect').on('change', function () {
                if (suppressChangeProduct) return; // Exit if we're already updating

                suppressChangeProduct = true;
                let selectedName = $(this).val();
                let selectedProduct = products.find(product => product.name === selectedName);

                if (selectedProduct) {
                    $('#editpidSelect').val(selectedProduct.id).trigger('change');
                    $('#editpprice').val(selectedProduct.price);
                    $('#edittotal').val($('#editquantity').val() * $('#editpprice').val());
                }
                suppressChangeProduct = false;
            });
        }

        if (customers) {
            $('#edituidSelect').empty();
            $('#editunameSelect').empty();
            // Populate the select elements
            $('#edituidSelect').prepend(new Option(rowData.uid, rowData.uid));
            $('#editunameSelect').prepend(new Option(rowData.uname, rowData.uname));

            customers.forEach(customer => {
                if (customer.id !== rowData.uid) {
                    $('#edituidSelect').append(new Option(customer.id, customer.id));
                    $('#editunameSelect').append(new Option(customer.name + " " + customer.lastname, customer.name + " " + customer.lastname));
                }
            });

            // Flag to prevent event loop
            let suppressChangeCustomer = false;

            // Event listener for pidSelect
            $('#edituidSelect').on('change', function () {

                if (suppressChangeCustomer) return; // Exit if we're already updating

                suppressChangeCustomer = true;
                let selectedId = $(this).val();
                let selectedCustomer = customers.find(customer => customer.id === selectedId);

                if (selectedCustomer) {
                    $('#editunameSelect').val(selectedCustomer.name + " " + selectedCustomer.lastname).trigger('change');
                }
                suppressChangeCustomer = false;
            });

            // Event listener for unameSelect
            $('#editunameSelect').on('change', function () {
                if (suppressChangeCustomer) return; // Exit if we're already updating

                suppressChangeCustomer = true;
                let selectedName = $(this).val();
                let [firstName, lastName] = selectedName.split(' ');

                let selectedCustomer = customers.find(customer =>
                    customer.name === firstName && customer.lastname === lastName
                );

                if (selectedCustomer) {
                    $('#edituidSelect').val(selectedCustomer.id).trigger('change');
                }
                suppressChangeCustomer = false;
            });
        }

        $('#editSaleId').val(rowData.id);
        $('#editpprice').val(rowData.pprice);
        $('#editquantity').val(rowData.quantity);
        $('#edittotal').val(rowData.total);
        $('#editquantity').on('input', function () {
            $('#edittotal').val($(this).val() * $('#editpprice').val());
        })
    });

    $('#updateSaleButton').on('click', function () {

        var stockCheck = false;
        var balanceCheck = false;

        let id = $('#editSaleId').val();
        let pid = $('#editpidSelect').val();
        let pname = $('#editpnameSelect').val();
        let pprice = $('#editpprice').val();
        let uid = $('#edituidSelect').val();
        let uname = $('#editunameSelect').val();
        let quantity = $('#editquantity').val();
        let total = $('#edittotal').val();

        let products = JSON.parse(localStorage.getItem('products'));
        let customers = JSON.parse(localStorage.getItem('customers'));
        let sales = JSON.parse(localStorage.getItem('sales'));

        let sale = sales.find(sales => sales.id === id);

        let n_product = products.find(products => products.id === pid);
        let n_customer = customers.find(customer => customer.id === uid);

        let o_product = products.find(products => products.id === sale.pid);
        let o_customer = customers.find(customer => customer.id === sale.uid);

        if (pid === sale.pid && uid === sale.uid && quantity === sale.quantity) {
            alertify.message("Herhangi bir değişiklik yapılmadı!");
            return;
        }

        if (o_product != n_product) {
            if (+n_product.quantity < +quantity) {
                alertify.error("Stokta yeteri kadar " + n_product.name + " yok!");
                stockCheck = false;
                return;
            } else {
                stockCheck = true;
            }
        } else {
            if (+sale.quantity + (+o_product.quantity) < + quantity) {
                alertify.error("İade + stoktaki miktar, yeni miktarı karşılamıyor.");
                stockCheck = false;
                return;
            } else {
                stockCheck = true;
            }
        }

        if (uid == sale.uid) {
            if (+sale.total + +o_customer.balance < +total) {
                alertify.error("İade + bakiye, yeni tutarı karşılamıyor.");
                balanceCheck = false;
                return;
            } else {
                balanceCheck = true;
            }
        } else {
            if (+n_customer.balance < total) {
                alertify.error("Yetersiz bakiye!");
                balanceCheck = false;
                return;
            } else {
                balanceCheck = true;
            }
        }

        if (!stockCheck) {
            alertify.error("Stok Hatası");
        }
        if (!balanceCheck) {
            alertify.error("Bakiye Hatası");
        }

        if (stockCheck && balanceCheck) {            
            
            n_product.quantity -= +quantity;
            o_product.quantity += +sale.quantity;

            n_product.stockCost = n_product.quantity * +n_product.buyingPrice;
            o_product.stockCost = o_product.quantity * +o_product.buyingPrice;

            n_product.totalPrice = n_product.quantity * +n_product.price;
            o_product.totalPrice = o_product.quantity * +o_product.price;

            n_customer.balance -= total;
            o_customer.balance += Number(sale.total);

            sale.pid = pid;
            sale.pname = pname;
            sale.pprice = pprice;
            sale.uid = uid;
            sale.uname = uname;
            sale.quantity = quantity;
            sale.total = total;


            localStorage.setItem('products', JSON.stringify(products));
            localStorage.setItem('customers', JSON.stringify(customers));
            saveToLocalStorage(sales);
            $('#saleActionModal').modal('hide');
            table.clear().rows.add(sales).draw();
            updateChart();
        }

    })


    $('#deleteSaleButton').on('click', function () {
        var id = $('#editSaleId').val();
        let sales = JSON.parse(localStorage.getItem('sales')) || [];
        sales = sales.filter(p => p.id !== id);
        saveToLocalStorage(sales);
        table.clear().rows.add(sales).draw();
        $('#saleActionModal').modal('hide');
        alertify.success('Satış başarılı bir şekilde silindi.');
        updateChart();
    });

    loadTableData();
})