<template>
  <div id="app">
    <v-app class="LoginDiv">
      <v-layout justify-center>
        <v-flex xs12 sm8 md6>
            <v-alert
              v-if=" newForumStatus != null"
              :type="newForumStatus.type"
              outlined
              text
              :icon="newForumStatus.icon"
              transition="scale-transition"
              >{{newForumStatus.message}}</v-alert>
          <div class="forums">
            <v-toolbar style="background-color:#1976d2">
              <v-toolbar-title>Forums</v-toolbar-title>
              <v-spacer></v-spacer>

              <v-dialog v-model="add">
                <newforumform v-if="add" @notifyNewForum="forumAdded" @notifyNewForumStatus="showNewForumStatus"></newforumform>
              </v-dialog>

              <v-btn v-if="user.loggedIn" small fab dark color="blue" @click="add = !add">
                <v-icon>{{ add ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
              </v-btn>
            </v-toolbar>
            <v-data-table
              :headers="headers"
              :items="forums"
              item-key="id"
              class="elevation-1"
              :search="search"
              :custom-filter="filterText"
              align-center
            >
              <template v-slot:item.creation_date="{item}">
                <p>{{item.creation_date | formatDate}}</p>
              </template>

              <template v-if="user.loggedIn" v-slot:item.actions="{ item }" align-left>
                <div class="itemAction">
                  <v-icon color="blue" @click="moreDetails(item)">mdi-arrow-right-bold-circle-outline</v-icon>
                  <v-icon
                    v-if="verifyDelete(item.creator)"
                    color="red"
                    @click="deleteForum(item)"
                    >mdi-trash-can-outline</v-icon>
                  </div>
              </template>

              <template v-slot:top>
                <v-text-field v-model="search" label="Search Forum" class="mx-4"></v-text-field>
              </template>
            </v-data-table>
          </div>          
        </v-flex>
      </v-layout>
    </v-app>
  </div>
</template>

<script>
import firebase from "../config/firebase";
import { mapGetters } from "vuex";
import newforumform from "./NewForumForm";
export default {
  data() {
    return {
      db: firebase.firestore(),
      forums: [],
      search: "",
      add: false,
      newForumStatus: null
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Title",
          sortable: true,
          value: "title",
          align: "center"
        },
        {
          text: "Creator",
          sortable: true,
          value: "creator.id",
          align: "center"
        },
        {
          text: "Creation Date",
          sortable: true,
          value: "creation_date",
          align: "center"
        },
        { text: "", value: "actions", sortable: false, align: "center" }
      ];
    },
    ...mapGetters({
      user: "user"
    })
  },
  components: {
    newforumform
  },
  methods: {
    filterText(value, search) {
      return (
        value != null &&
        search != null &&
        typeof value === "string" &&
        value.toString().indexOf(search) !== -1
      );
    },
    refresh() {
      this.forums = [];
      this.add = false,
      this.db
        .collection("entries")
        .get()
        .then(entries => {
          entries.forEach(entry => {
            if (entry.data().parent === null) {
              this.forums.push(entry.data());
            }
          });
        });
    },
    moreDetails(item) {
      return this.$router.push({ path: "/forums/forum/" + item.id });
    },
    forumAdded() {
      this.add = false;
      this.refresh();
    },
    deleteForum(item) {
      this.db.collection("entries").get().then(entries => 
      {
          let forumWithEntries = false;
          entries.forEach(entry => 
          {
            if (entry.data().parent != null && entry.data().parent.id === item.id)
            {
              forumWithEntries = true;
            }
          });
          if (!forumWithEntries) 
          {
            this.db.collection("entries").doc(item.id).delete().then(() => 
            {
                console.log("Document successfully deleted!");
                this.refresh();
                let newForumStatus  = 
                {
                  type: 'success',
                  message: "Your forum was deleted",
                  icon: 'mdi-checkbox-marked-circle-outline'
                }
                this.showNewForumStatus(newForumStatus)
            })
            .catch(function(error) {
              console.error("Error removing document: ", error);
            });
          } 
          else 
          {
            let newForumStatus  = 
            {
              type: 'error',
              message: "Forums with entries can't be deleted",
              icon: 'mdi-skull-outline'
            }
            this.showNewForumStatus(newForumStatus)
          }
        });
    },
    verifyDelete(creator) {
      return this.user.data.email === creator.id;
    },
    showNewForumStatus(status)
    {
      this.newForumStatus = status
      setTimeout(() => this.newForumStatus = null, 3000);
    }
  },
  filters: {
    formatDate: function(timestamp) {
      if (!timestamp) return "";
      return new Date(timestamp.seconds * 1000).toLocaleDateString("es-ES");
    }
  },
  mounted: function() {
    this.refresh();
  }
};
</script>

<style scoped>
.LoginDiv {
  padding-top: 5%;
}
.forums {
  -webkit-box-shadow: 0px 0px 23px 2px rgba(0, 0, 0, 0.21);
  -moz-box-shadow: 0px 0px 23px 2px rgba(0, 0, 0, 0.21);
  box-shadow: 0px 0px 23px 2px rgba(0, 0, 0, 0.21);
  margin: 3%;
}
.v-toolbar__title {
  align-content: center;
  font-size: 180%;
  color: white;
}
.v-dialog_content {
    overflow-y:hidden;
}
.itemAction{
  float: left;
}
.v-dialog {
    width: 50%;
}
</style>