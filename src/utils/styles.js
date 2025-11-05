import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  pageWrapper: { 
    flex: 1, 
    padding: 6, 
    backgroundColor: "#fff" 
  },
  mapWrapper: { 
    flex: 1, 
    borderRadius: 8, 
    overflow: "hidden", 
    backgroundColor: "#f8f9fa", 
    borderWidth: 1, 
    borderColor: "#eee" 
  },
  map: { 
    flex: 1, 
    minHeight: 300 
  },
});