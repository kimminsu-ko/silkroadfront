import {defineStore} from 'pinia';
import {fetchMyProfile} from "@/api/user.js";
import {signIn, signOut} from "@/api/auth.js";

export const useAuthStore = defineStore('auth',{
    state : ()=>({
        user : null,
        loading : false,
    }),
    getters:{
        isLoggedIn : state => !!state.user,
        isAdmin : state => state.user?.role === 1,
    },
    actions : {
        setUser(user){
            this.user = user;
            if(user){
                localStorage.setItem('user',JSON.stringify(user))
            }else{
                localStorage.removeItem('user')
            }
        },
        //로그인 하고 유저정보 가져옴
        async login({userId,userPassword}){
            this.loading = true
            try{
                await signIn({userId,userPassword})

                const res = await fetchMyProfile()
                this.setUser(res.data.data)
            }finally {
                this.loading = false
            }
        },
        //로그인 되어있는지 체크하는 메서드
        async loadUserFromStorage() {
            const raw = localStorage.getItem('user');
            if (raw) {
                try {
                    this.user = JSON.parse(raw);
                } catch {
                    this.user = null;
                }
            } else {
                this.user = null;
            }

            // 핵심: 토큰 없으면 서버 프로필 조회를 시도하지 말 것
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            try {
                const res = await fetchMyProfile();
                this.setUser(res.data.data);
            } catch (e) {
                // 토큰이 있는데도 401이면 만료/무효니까 싹 비움
                this.setUser(null);
            }
        },
        //로그아웃하면서 저장된거 밀어주기
        async logout(){
            try{
                await signOut()
            }catch(_){}
            this.setUser(null)
        }
    }
})
//localStorage.removeItem('user')
//localStorage.getItem('user')