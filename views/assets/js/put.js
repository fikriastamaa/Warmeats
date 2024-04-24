$(document).ready(function () {
    // Lakukan permintaan AJAX untuk mengambil data Warmindo dari backend
    $.ajax({
        url: "http://localhost:3307/api/warmindos/fetch-all", // Sesuaikan dengan endpoint yang Anda miliki
        method: "GET",
        success: function (response) {
            // Ketika permintaan berhasil, tambahkan data Warmindo ke dalam daftar kartu
            response.warmindo.forEach(function (warmindo, index) {
                $("#warmindo-list").append(`
            <div class="col-lg-4 menu-item">
              <a href="${warmindo.picture}" class="glightbox">
                <img src="${warmindo.picture}" class="menu-img img-fluid rounded-circle"  weidth="200" height="300" alt="${warmindo.name}">
              </a>
              <div class="card-body text-center">
                <h5>${warmindo.name}</h5>
                <p class="ingredients">${warmindo.address}</p>
                <button class="btn btn-primary" onclick="lihatWarmindo(${warmindo.id})">Lihat Warmindo</button>
              </div>
            </div>
          `);
        });
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  
    // Dapatkan warmindoId dari URL
    var urlParams = new URLSearchParams(window.location.search);
    var warmindoId = urlParams.get('warmindoId');

    // Lakukan permintaan AJAX
    $.ajax({
        url: "http://localhost:3307/api/menus/fetch-all/" + warmindoId,
        method: "GET",
        success: function(response) {
            if (response.status === "Success") {
                response.menus.forEach(function(menu, index) {
                    $("#menu-list").append(`
                        <div class="col-lg-4 menu-item">
                            <a href="${menu.picture}" class="glightbox">
                                <img src="${menu.picture}" class="menu-img img-fluid" alt="${menu.name}">
                            </a>
                            <h4>${menu.name}</h4>
                            <p class="price">Rp.${menu.price}</p>
                        </div>
                    `);
                });
            } else {
                console.error("Error:", response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        },
    }); 
});
  
function lihatWarmindo(warmindoId) {
    // Redirect ke halaman warmindomenu.php dengan menyertakan parameter warmindoId
    window.location.href = `warmindomenu.php?warmindoId=${warmindoId}`;
}
