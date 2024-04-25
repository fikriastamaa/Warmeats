<script>
    $(document).ready(function() {
        $("#registerForm").submit(function(event) {
            event.preventDefault(); // Mencegah formulir untuk submit secara default

            var formData = {
                fullName: $("#fullName").val(),
                email: $("#email").val(),
                phoneNumber: $("#phoneNumber").val(),
                password: $("#password").val()
            };

            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: "http://localhost:3307/api/users/register",
                data: JSON.stringify(formData),
                dataType: 'json',
                success: function(data) {
                    console.log(data);
                    alert("Registration successful!");
                    // Redirect or perform other actions as needed
                },
                error: function(error) {
                    console.error('Error:', error);
                    alert("Registration failed. Please try again.");
                }
            });
        });
    });
</script>