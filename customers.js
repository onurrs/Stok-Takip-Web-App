$(document).ready(function () {

    moment.locale('tr');

    $('#dateFormatSelector').select2({
        placeholder: 'Bir tarih formatı seçin',
        allowClear: false,
        theme: "classic"
    });

    var table = $('#customerTable').DataTable({
        pageLength: 5,
        lengthMenu: [5, 10, 15, 20, 50, 100, 200, 500],
        columns: [
            { data: 'id' },
            { data: 'tckn' },
            { data: 'name' },
            { data: 'lastname' },
            { data: 'phone' },
            { data: 'email' },
            { data: 'password' },
            { data: 'balance' },
            { data: 'createdAt' },
            { data: null, defaultContent: '<button type="button" data-toggle="modal" data-target="#customerActionModal" class="btn btn-info customer-edit-btn" style="margin-left: 5px; margin-right: 5px">Düzenle</button><button type="button" data-toggle="modal" data-target="#customerPasswordModal" class="btn btn-info customer-edit-psw-btn" style="margin-left: 5px; margin-right: 5px">Şifre Değiş</button>' },
        ],
        columnDefs: [
            { title: "ID", targets: 0 },
            { title: "TCKN", targets: 1 },
            { title: "İsim", targets: 2 },
            { title: "Soyisim", targets: 3 },
            { title: "Telefon", targets: 4 },
            { title: "Email", targets: 5 },
            { title: "Şifre (MD5)", targets: 6 },
            { title: "Bakiye", targets: 7 },
            { title: "Kayıt Tarihi", targets: 8 },
            { title: "İşlem", width: '250px', searchable: false, targets: 9 },
        ],
        "language": trTranslation,
        lengthChange: true,
    });

    function loadTableData() {
        let customers = JSON.parse(localStorage.getItem('customers')) || [];
        
        if(customers && customers.length > 0){
            table.clear().rows.add(customers).draw();
            alertify.success('Veriler başarılı bir şekilde çekildi.');
        }
    }


    function saveToLocalStorage(data) {
        localStorage.setItem('customers', JSON.stringify(data));
        alertify.success('Veriler başarılı bir şekilde kaydedildi.');
    }

    function encrypt(pass) {
        var hash = CryptoJS.MD5(pass);
        return hash.toString(CryptoJS.enc.Hex);
    }

    $('#saveCustomerButton').on('click', function () {
        let tckn = $('#customerTckn').val();
        let name = $('#customerName').val();
        let lastname = $('#customerLastname').val();
        let phone = $('#customerPhone').val();
        let email = $('#customerEmail').val();
        let password = encrypt($('#customerPassword').val());
        let balance = $('#customerBalance').val();

        
        
        if (tckn.length==11 && name && lastname && phone && email && password.length > 5 && balance) {
            let customers = JSON.parse(localStorage.getItem('customers')) || [];
            let newCustomer = {
                id: 'U' + Math.floor(10000 + Math.random() * 90000),
                tckn: tckn,
                name: name,
                lastname: lastname,
                phone: phone,
                email: email,
                password: password,
                balance: balance,
                createdAt: moment().format('LL')
            };
            customers.push(newCustomer);
            saveToLocalStorage(customers);
            table.row.add(newCustomer).draw();
            $('#addCustomerModal').modal('hide');
            $('#addCustomerForm')[0].reset();

        } else {
            if (!tckn || !name || !lastname || !phone || !email || !password || !balance){
                alertify.error('Tüm alanları doldurunuz!');
            }
            if (tckn.length != 11){
                alertify.error('TCKN 11 Haneli Olmalıdır!');
            }
            if (password.length <= 5){
                alertify.error('Şifreniz 5 Haneden Büyük Olmalıdır!');
            }
        }

    });

    $('#customerTable').on('click', '.customer-edit-btn', function () {

        var row = $(this).closest('tr');
        var rowData = $('#customerTable').DataTable().row(row).data();

        $('#editCustomerId').val(rowData.id);
        $('#editCustomerTckn').val(rowData.tckn);        
        $('#editCustomerName').val(rowData.name);
        $('#editCustomerLastname').val(rowData.lastname);
        $('#editCustomerPhone').val(rowData.phone);
        $('#editCustomerEmail').val(rowData.email);
        $('#editCustomerBalance').val(rowData.balance);

    });


    $('#updateCustomerButton').on('click', function () {
        let id = $('#editCustomerId').val();
        let tckn = $('#editCustomerTckn').val();
        let name = $('#editCustomerName').val();
        let lastname = $('#editCustomerLastname').val();
        let phone = $('#editCustomerPhone').val();
        let email = $('#editCustomerEmail').val();
        let balance = $('#editCustomerBalance').val();




        let customers = JSON.parse(localStorage.getItem('customers')) || [];
        let index = customers.findIndex(c => c.id === id);

        if (index !== -1) {
            customers[index] = {
                id: customers[index].id,
                tckn: tckn,
                name: name,
                lastname: lastname,
                phone: phone,
                email: email,
                password: customers[index].password,
                balance: balance,
                createdAt: customers[index].createdAt,
            };
            saveToLocalStorage(customers);
            table.clear().rows.add(customers).draw();
            $('#customerActionModal').modal('hide');
            alertify.success('Müşteri başarılı bir şekilde güncelleştirildi.');
        }
    });

    $('#customerTable').on('click', '.customer-edit-psw-btn', function () {

        var row = $(this).closest('tr');
        var rowData = $('#customerTable').DataTable().row(row).data();

        $('#editCustomerId').val(rowData.id);
        $('#editCustomerPswName').val(rowData.name + " " + rowData.lastname);
    });

    $('#updateCustomerPswButton').on('click', function () {
        let id = $('#editCustomerId').val();
        let newPassword = $('#editCustomerNewPassword').val();

        let customers = JSON.parse(localStorage.getItem('customers')) || [];
        let index = customers.findIndex(c => c.id === id);

        if (index !== -1) {

            customers[index] = {
                id: customers[index].id,
                tckn: customers[index].tckn,
                name: customers[index].name,
                lastname: customers[index].lastname,
                phone: customers[index].phone,
                email: customers[index].email,
                password: encrypt(newPassword),
                balance: customers[index].balance,
                createdAt: customers[index].createdAt,
            };

            saveToLocalStorage(customers);
            table.clear().rows.add(customers).draw();
            $('#customerPasswordModal').modal('hide');
            alertify.success('Müşteri başarılı bir şekilde güncelleştirildi.');

        } else {
            alert("Veri Bulunamadı.")
        }
    });

    $('#deleteCustomerButton').on('click', function () {
        var id = $('#editCustomerId').val();
        let customers = JSON.parse(localStorage.getItem('customers')) || [];
        customers = customers.filter(c => c.id !== id);
        saveToLocalStorage(customers);
        table.clear().rows.add(customers).draw();
        $('#customerActionModal').modal('hide');
        alertify.success('Müşteri başarılı bir şekilde silindi.');
    });

    $('#dateFormatSelector').on('change', function() {
        let customers = JSON.parse(localStorage.getItem('customers')) || [];  
        
        for (let index = 0; index < customers.length; index++) {
            customers[index] = {
                id: customers[index].id,
                tckn: customers[index].tckn,
                name: customers[index].name,
                lastname: customers[index].lastname,
                phone: customers[index].phone,
                email: customers[index].email,
                password: customers[index].password,
                balance: customers[index].balance,
                createdAt: convertDateFormat(customers[index].createdAt, $(this).val()),
            };

            saveToLocalStorage(customers);
            table.clear().rows.add(customers).draw();
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

    loadTableData();

})