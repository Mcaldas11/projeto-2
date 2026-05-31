<template>
    <footer class="main-footer">
        <div class="footer-links">
            <div v-for="(column, index) in resolvedColumns" :key="`footer-col-${index}`" class="col">
                <router-link
                    v-for="link in column"
                    :key="`${index}-${link.label}-${link.to}`"
                    :to="link.to"
                >
                    {{ link.label }}
                </router-link>
            </div>
        </div>
        <div class="footer-brand">
            <img :src="resolvedLogoSrc" alt="Logo" class="logo-img-small" />
            <p class="copyright">© 2026 VC Comunica All rights reserved.</p>
        </div>
    </footer>
</template>

<script setup>
import { computed } from 'vue'
import defaultLogo from '@/assets/logo.svg'
import { getAccountRoute } from '@/utils/auth'

const props = defineProps({
    columns: {
        type: Array,
        default: null,
    },
    logoSrc: {
        type: String,
        default: '',
    },
})

const roleAwareDefaultColumns = computed(() => {
    const role = localStorage.getItem('role') || ''

    const homeRouteByRole = {
        admin: '/admin',
        trabalhador: '/trabalhador',
        responsavel: '/responsavel/perfil',
    }

    const homeRoute = homeRouteByRole[role] || '/'
    const accountLabel = role === 'cidadao' || !role ? 'Conta' : 'Perfil'
    const accountRoute = role === 'cidadao' || !role ? '/conta' : getAccountRoute()

    return [
        [
            { label: 'Home', to: homeRoute },
            { label: 'Ocorrências', to: '/ocorrencias' },
            { label: 'Mapa Ocorrências', to: '/ocorrencias' },
        ],
        [
            { label: 'Sobre', to: '/sobre' },
            { label: accountLabel, to: accountRoute },
        ],
    ]
})

const resolvedColumns = computed(() =>
    Array.isArray(props.columns) && props.columns.length ? props.columns : roleAwareDefaultColumns.value,
)
const resolvedLogoSrc = computed(() => props.logoSrc || defaultLogo)
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

.footer-brand {
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