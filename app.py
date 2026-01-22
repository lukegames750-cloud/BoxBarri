import streamlit as st
from datetime import datetime
import random
import string

# -----------------------------
# MODELOS SIMPLIFICADOS
# -----------------------------
class UserRole:
    CLIENTE = "cliente"
    REPARTIDOR = "repartidor"

class OrderStatus:
    PENDIENTE = "pendiente"
    ASIGNADO = "asignado"
    ENTREGADO = "entregado"

# -----------------------------
# UTILIDADES
# -----------------------------
def generate_id(prefix="BBX"):
    return f"{prefix}-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=4))

def generate_code():
    return "".join(random.choices(string.digits, k=4))

NEIGHBORHOODS = [
    "El Raval", "Gràcia", "Sants", "Poble Sec",
    "Eixample", "Sant Andreu"
]

# -----------------------------
# ESTADO GLOBAL (SESSION)
# -----------------------------
if "users" not in st.session_state:
    st.session_state.users = []

if "orders" not in st.session_state:
    st.session_state.orders = []

if "current_user" not in st.session_state:
    st.session_state.current_user = None

if "app_state" not in st.session_state:
    st.session_state.app_state = "welcome"

# -----------------------------
# PANTALLAS
# -----------------------------
def screen_welcome():
    st.title("📦 BarriBox")
    st.subheader("Logística vecinal")

    col1, col2 = st.columns(2)
    with col1:
        if st.button("Continuar"):
            st.session_state.app_state = "login"
    with col2:
        if st.button("Registrarme"):
            st.session_state.app_state = "register"


def screen_register():
    st.title("Crear cuenta")

    with st.form("register_form"):
        name = st.text_input("Nombre")
        phone = st.text_input("Teléfono (9 dígitos)")
        zone = st.selectbox("Barrio", NEIGHBORHOODS)
        role = st.selectbox("Rol", [UserRole.CLIENTE, UserRole.REPARTIDOR])
        submit = st.form_submit_button("Crear cuenta")

        if submit:
            if not name.replace(" ", "").isalpha():
                st.error("Nombre inválido")
                return
            if not phone.isdigit() or len(phone) != 9:
                st.error("Teléfono inválido")
                return

            user = {
                "id": generate_id("U"),
                "nombre": name,
                "telefono": phone,
                "zona": zone,
                "rol": role
            }
            st.session_state.users.append(user)
            st.session_state.current_user = user
            st.session_state.app_state = "main"


def screen_login():
    st.title("Iniciar sesión")

    role = st.selectbox("Tipo de usuario", [UserRole.CLIENTE, UserRole.REPARTIDOR])
    users = [u for u in st.session_state.users if u["rol"] == role]

    if not users:
        st.warning("No hay usuarios de este tipo")
        return

    for u in users:
        if st.button(f"{u['nombre']} ({u['zona']})"):
            st.session_state.current_user = u
            st.session_state.app_state = "main"


def screen_main():
    user = st.session_state.current_user
    st.sidebar.title(f"👤 {user['nombre']}")
    tab = st.sidebar.radio("Menú", ["Inicio", "Crear pedido", "Mis pedidos", "Salir"])

    if tab == "Inicio":
        st.subheader("Pedidos disponibles")

        for o in st.session_state.orders:
            st.markdown(f"""
            **{o['item']}**  
            Estado: `{o['estado']}`  
            Código: `{o['code']}`
            """)

            if user["rol"] == UserRole.REPARTIDOR and o["estado"] == OrderStatus.PENDIENTE:
                if st.button(f"Asignarme {o['id']}"):
                    o["estado"] = OrderStatus.ASIGNADO
                    o["repartidor"] = user["nombre"]

    if tab == "Crear pedido" and user["rol"] == UserRole.CLIENTE:
        with st.form("order_form"):
            item = st.text_input("Objeto a enviar")
            submit = st.form_submit_button("Crear pedido")

            if submit:
                order = {
                    "id": generate_id(),
                    "item": item,
                    "cliente": user["nombre"],
                    "estado": OrderStatus.PENDIENTE,
                    "code": generate_code(),
                    "created": datetime.now()
                }
                st.session_state.orders.append(order)
                st.success("Pedido creado")

    if tab == "Mis pedidos":
        for o in st.session_state.orders:
            if o.get("cliente") == user["nombre"]:
                st.write(o)

    if tab == "Salir":
        st.session_state.current_user = None
        st.session_state.app_state = "welcome"


# -----------------------------
# ROUTER
# -----------------------------
state = st.session_state.app_state

if state == "welcome":
    screen_welcome()
elif state == "register":
    screen_register()
elif state == "login":
    screen_login()
elif state == "main":
    screen_main()
