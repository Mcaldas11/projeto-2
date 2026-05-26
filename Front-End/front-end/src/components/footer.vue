<template>
    <footer class="main-footer">
      <div class="footer-links">
        <div class="col">
          <router-link to="/">Home</router-link>
          <router-link to="/ocorrencias">Ocorrências</router-link>
          <router-link to="/ocorrencias">Mapa Ocorrências</router-link>
        </div>
        <div class="col">
          <router-link to="/sobre">Sobre</router-link>
          <router-link to="/conta">Conta</router-link>
        </div>
      </div>
      <div class="footer-brand">
        <img src="@/assets/logo.svg" alt="Logo" class="logo-img-small" />
        <p class="copyright">© 2026 VC Comunica All rights reserved.</p>
      </div>
    </footer>
</template>

<script>
    export default {
        name: 'FooterComponent'
    }
</script>

<style scoped>

    .main-footer {
        padding: 60px 80px;
        background-color: #f5f1e9;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 60px;
    }
    .footer-links {
        display: flex;
        gap: 60px;
    }
    .col {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .col a {
        text-decoration: none;
        color: #2d5a27;
        font-weight: 600;
    }
    .footer-brand{
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .logo-img-small {
        align-items: center;
        height: 40px;
    }
    .copyright {
        font-size: 0.8rem;
        color: #888;
        margin-top: 10px;
    }
</style>